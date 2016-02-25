<?php

/**
 * @file
 * Page callback file for the Writing365 module.
 */

/**
 * Menu callback; displays a Drupal page containing recent journal entries of a given user.
 */
function writing365_page_user($account)
{
    global $user;

    drupal_set_title($title = t("@name's Write 365 Journal", array('@name' => format_username($account))), PASS_THROUGH);
    /*if (!($account->uid == $user->uid)) {
        drupal_set_message(t('You do not have permission to view this journal.'));
        return;
    }
    */

    $build = array();

    $query = db_select('node', 'n')->extend('PagerDefault');
    $nids = $query
        ->fields('n', array('nid', 'sticky', 'created'))
        ->condition('type', 'writing365')
        ->condition('uid', $account->uid)
        ->condition('status', 1)
        ->orderBy('sticky', 'DESC')
        ->orderBy('created', 'DESC')
        ->limit(variable_get('default_nodes_main', 10))
        ->addTag('node_access')
        ->execute()
        ->fetchCol();

    if (!empty($nids)) {
        $nodes = node_load_multiple($nids);
        $build += node_view_multiple($nodes);
        $build['pager'] = array(
            '#theme' => 'pager',
            '#weight' => 5,
        );
    } else {
        if ($account->uid == $user->uid) {
            drupal_set_message(t('You have not created any journal entries.'));
        } else {
            drupal_set_message(t('!author has not created any journal entries.', array('!author' => theme('username', array('account' => $account)))));
        }
    }
    drupal_add_feed('writing365/' . $account->uid . '/feed', t('RSS - !title', array('!title' => $title)));

    return $build;
}

/**
 * Menu callback; displays a Drupal page containing recent journal entries of all users.
 */
function writing365_page_last()
{
    global $user;
    $build = array();

    $query = db_select('node', 'n')->extend('PagerDefault');
    $nids = $query
        ->fields('n', array('nid', 'sticky', 'created'))
        ->condition('type', 'writing365')
        ->condition('status', 1)
        ->orderBy('sticky', 'DESC')
        ->orderBy('created', 'DESC')
        ->limit(variable_get('default_nodes_main', 10))
        ->addTag('node_access')
        ->execute()
        ->fetchCol();

    if (!empty($nids)) {
        $nodes = node_load_multiple($nids);
        $build += node_view_multiple($nodes);
        $build['pager'] = array(
            '#theme' => 'pager',
            '#weight' => 5,
        );
    } else {
        drupal_set_message(t('No journal entries have been created.'));
    }
    drupal_add_feed('journal/feed', t('RSS - journals'));

    return $build;
}

function writing365_page_info_last()
{
    global $user;
    $build = array();
    drupal_set_title($title = t("Write 365 Journal WordSalad Summary"), PASS_THROUGH);

    $build = "<p>WordSalad is a text analysis service designed to analyze the authenticity of journal entries. WordSalad computes a probability that a journal entry was written by a person rather then fabricated using other means such as text-to-speech or random key strokes. Note: Only journal entries after January 7th, 2016 are included in this view.</p>";
    $build .= "<p><i class=\" fa fa-exclamation-triangle fa-2x\" style=\"color:#f08080;\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably not</u> structured English.<br />";
    $build .= "<i class=\" fa fa-check fa-2x\" style=\"color:#90ee90;\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably</u> structured English.</p>";


    # configure the table header columns
    $header = array(
        array('data' => 'Node ID', 'field' => 'nid'),
        array('data' => 'Title', 'field' => 'title', 'sort' => 'ASC'),
        array('data' => 'Created', 'field' => 'created', 'sort' => 'ASC'),
        array('data' => 'WordSalad', 'field' => 'is_wordsalad'),
        array('data' => 'Wordcount', 'field' => 'wordcount'),

    );

    $result = db_select('node', 'n')->extend('PagerDefault');

    $result->fields('n', array('nid', 'title', 'type', 'created'))
        ->fields('w', array('is_wordsalad', 'percent', 'score'))
        ->fields('wc', array('wordcount', 'timewriting', 'wordsperminute'))
        ->condition('type', 'writing365')
        ->condition('status', 1)
        ->orderBy('created', 'DESC')
        ->addTag('node_access');

    // ->range(0, variable_get('writing365_block_count', 10))
    $result->join('wordsalad_score', 'w', 'w.nid = n.nid');
    $result->join('W365_JournalNodeData', 'wc', 'wc.nid = n.nid');

    $results = $result->execute();


    $rows = array();

    foreach ($results as $row) {
        if ($row->is_wordsalad) {
            $wordsalad = '<i class=" fa fa-exclamation-triangle fa-2x" style="color:#f08080;"></i>';
        } else {
            $wordsalad = '<i class=" fa fa-check fa-2x" style="color:#90ee90;"></i>';
        }
        $rows[] = array(
            "nid" => $row->nid,
            "title" => "<a href='/node/" . $row->nid . "''/>" . $row->title . "</a>",
            "created" => date('F j, Y, g:i a', $row->created),
            "is_wordsalad" => $wordsalad,
            "wordcount" => $row->wordcount,
        );
    }

    $build .= theme('table', array('header' => $header, 'rows' => $rows));

    # add the pager
    $build .= theme('pager');

    return $build;

}

/**
 * Menu callback; displays a Drupal page containing recent journal entries, wordcount and wordsalad of user.
 */

function writing365_page_info($account)
{
    global $user;
    $build = array();
    drupal_set_title($title = t("@name's Write 365 Journal Summary", array('@name' => format_username($account))), PASS_THROUGH);

    $build = "<p>WordSalad is a text analysis service designed to analyze the authenticity of journal entries. WordSalad computes a probability that a journal entry was written by a person rather then fabricated using other means such as text-to-speech or random key strokes. Note: Only journal entries after January 7th, 2016 are included in this view.</p>";
    $build .= "<p><i class=\" fa fa-exclamation-triangle fa-2x\" style=\"color:#f08080;\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably not</u> structured English.<br />";
    $build .= "<i class=\" fa fa-check fa-2x\" style=\"color:#90ee90;\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably</u> structured English.</p>";


    # configure the table header columns
    $header = array(
        array('data' => 'Title', 'field' => 'title', 'sort' => 'ASC'),
        array('data' => 'Created', 'field' => 'created', 'sort' => 'ASC'),
        array('data' => 'WordSalad', 'field' => 'is_wordsalad'),
        array('data' => 'Wordcount', 'field' => 'wordcount'),

    );

    $result = db_select('node', 'n')->extend('PagerDefault');

    $result->fields('n', array('nid', 'title', 'type', 'created'))
        ->fields('w', array('is_wordsalad', 'percent', 'score'))
        ->fields('wc', array('wordcount', 'timewriting', 'wordsperminute'))
        ->condition('type', 'writing365')
        ->condition('status', 1)
        ->condition('uid', $account->uid)
        ->orderBy('created', 'DESC')
        ->addTag('node_access');

    // ->range(0, variable_get('writing365_block_count', 10))
    $result->join('wordsalad_score', 'w', 'w.nid = n.nid');
    $result->join('W365_JournalNodeData', 'wc', 'wc.nid = n.nid');

    $results = $result->execute();


    $rows = array();

    foreach ($results as $row) {
        if ($row->is_wordsalad) {
            $wordsalad = '<i class=" fa fa-exclamation-triangle fa-2x" style="color:#f08080;"></i>';
        } else {
            $wordsalad = '<i class=" fa fa-check fa-2x" style="color:#90ee90;"></i>';
        }
        $rows[] = array(
            "title" => "<a href='/node/" . $row->nid . "''/>" . $row->title . "</a>",
            "created" => date('F j, Y, g:i a', $row->created),
            "is_wordsalad" => $wordsalad,
            "wordcount" => $row->wordcount,
        );
    }

    $build .= theme('table', array('header' => $header, 'rows' => $rows));

    # add the pager
    $build .= theme('pager');

    return $build;

}





