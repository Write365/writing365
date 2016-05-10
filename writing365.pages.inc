<?php

/**
 * @file
 * Page callback file for the Writing365 module.
 */

/**
 * Menu callback; displays a Drupal page containing recent journal entries of a given user.
 */
function user_journal()
{
    global $user;

    drupal_set_title($title = t("@name's Write 365 Journal", array('@name' => format_username($user))), PASS_THROUGH);

    $build = array();

    $query = db_select('node', 'n')->extend('PagerDefault');
    $nids = $query
        ->fields('n', array('nid', 'sticky', 'created'))
        ->condition('type', 'writing365')
        ->condition('uid', $user->uid)
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

        drupal_add_feed('writing365/' . $user->uid . '/feed', t('RSS - !title', array('!title' => $title)));


    }
    return $build;
}

function user_dashboard()
{
    global $user;


    drupal_set_title($title = t("@name's Write 365 Dashboard", array('@name' => format_username($user))), PASS_THROUGH);


    // Start Page build
    $build = "";


    // Selecting post for students
    $result = db_select('node', 'n');

    $result->fields('n', array('nid', 'title', 'type'))
        ->fields('w', array('is_wordsalad', 'percent', 'score'))
        ->fields('wc', array('wordcount', 'timewriting', 'wordsperminute'))
        ->condition('type', 'writing365')
        ->condition('status', 1)
        ->condition('uid', $user->uid)
        ->addTag('node_access')
        ->addField('n', 'created', 'date');

    $result->join('wordsalad_score', 'w', 'w.nid = n.nid');
    $result->join('W365_JournalNodeData', 'wc', 'wc.nid = n.nid');

    // Execute the query
    $studentPost = $result->execute()->fetchAll();

    // Student Post Stats
    $wordTotal = 0;  // total number of words for the entire term.
    $entryTotal = 0; // total number of entries for the entire term.
    $wordPerEntry = 0; // average words per entry.
    $wordSalad = 0; // number of WordSalad post

    // Gathering Information on student post
    foreach ($studentPost as $key => $post) {
        // Formatting Date
        if (property_exists($post, 'date')) {
            // January = 0 not 1
            $day = date('d', $post->date);
            $month = date('m', $post->date);
            $year = date('Y', $post->date);
            // Puts months in javascript date format
            // January = 0 != 1
            if ($month - 1 < 0) {
                $month = 11;
            } else {
                $month--;
            }
            // Add a 0 for months less then 10
            if ($month < 10) {
                $month = '0' . $month;
            }
            $studentPost[$key]->date = $year . '-' . $month . '-' . $day;
        }

        // Count number of WordSalad post
        if ($post->is_wordsalad) {
            $wordSalad++;
        }

        // Tallies number of entries
        $entryTotal++;

        // Totaling word count
        $wordTotal += $post->wordcount;

    }

    // Gets average words per entry
    if ($entryTotal != 0) {
        $wordPerEntry = round($wordTotal / $entryTotal, 3);
    } else { // Defaults to 0.0, if $entryTotal is 0
        $wordPerEntry = 0.0;
    }


    // Displaying Post Statistics
    $build .= '<h3 class="section-header">Student Post Statistics</h3>';

    $build .= '<div class="row-fluid">'
        . '<div class="span3"><p><strong>Word Total</strong></p><p>' . $wordTotal . '</p></div>'
        . '<div class="span3"><p><strong>Entries Total</strong></p><p>' . $entryTotal . '</p></div>'
        . '<div class="span3"><p><strong>Words/Entries</strong></p><p>' . $wordPerEntry . '</p></div>'
        . '<div class="span3"><p><strong>WorldSalad Count</strong></p><p>' . $wordSalad . '</p></div>'
        . '</div>';


    // TACAL resources
    // Loaded from Write365
    // If not installed add js load for TACAL here.

    // Custom TACAL js
    drupal_add_js(drupal_get_path('module', 'reports_registration') . '/js/student-detail.js', 'file');
    drupal_add_js(array('reportsregistration' => array('studentid' => $user->uid, 'studentpost' => json_encode($studentPost))), array('type' => 'setting'));

    // Display Div for TACAL
    // Displaying  TACAL
    $build .= '<h4 class="section-header">Streak Calendar</h4>';
    $build .= '<div id="' . $user->uid . '"></div>';

    // Displaying student post
    $build .= '<h4 class="section-header">WordSalad</h4>';
    $build .= "<p><i class=\" fa fa-exclamation-triangle fa-2x\" style=\"color:#f08080;\" title=\"Exclamation Triangle\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably not</u> structured English.<br />";
    $build .= "<i class=\" fa fa-check fa-2x\" style=\"color:#90ee90;\" title=\"Check Mark\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably</u> structured English.</p>";


    // Configure the table header columns
    $header = array(
        array('data' => 'Node Id', 'field' => 'nid'),
        array('data' => 'Title', 'field' => 'title'),
        array('data' => 'Created', 'field' => 'created', 'sort' => 'desc'),
        array('data' => 'Status', 'field' => 'is_wordsalad'),
        array('data' => 'Wordcount', 'field' => 'wordcount'),
    );

    $result->extend('TableSort')
        ->orderByHeader($header); //then use an extender to create the sorted table
    $results = $result->execute();

    // Creating rows for table
    $rows = array();

    foreach ($results as $row) {
        if ($row->is_wordsalad) {
            $wordsalad = '<i class=" fa fa-exclamation-triangle fa-2x" style="color:#f08080;" title="Exclamation Triangle"></i>';
        } else {
            $wordsalad = '<i class=" fa fa-check fa-2x" style="color:#90ee90;" title="Check Mark"></i>';
        }
        $rows[] = array(
            "nid" => $row->nid,
            "title" => "<a href='/node/" . $row->nid . "''/>" . $row->title . "</a>",
            "created" => date('F j, Y, g:i a', $row->date),
            "is_wordsalad" => $wordsalad,
            "wordcount" => $row->wordcount,
        );
    }

    $build .= theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('class' => array('write365-table'))));

    // Add the pager
    $build .= theme('pager');

    return $build;
}

/**
 * Menu callback; displays a Drupal page containing recent journal entries of all users.
 */
function adm_user_journal($account)
{
    $build = array();
    drupal_set_title($title = t("@name's Write 365 Journal", array('@name' => format_username($account))), PASS_THROUGH);

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
        drupal_set_message(t('No journal entries have been created.'));
    }

    return $build;
}

function adm_user_dashboard($account)
{

    drupal_set_title($title = t("@name's Write 365 Dashboard", array('@name' => format_username($account))), PASS_THROUGH);


    // Start Page build
    $build = "";

    // Selecting post for students
    $result = db_select('node', 'n');

    $result->fields('n', array('nid', 'title', 'type'))
        ->fields('w', array('is_wordsalad', 'percent', 'score'))
        ->fields('wc', array('wordcount', 'timewriting', 'wordsperminute'))
        ->condition('type', 'writing365')
        ->condition('status', 1)
        ->condition('uid', $account->uid)
        ->addTag('node_access')
        ->addField('n', 'created', 'date');

    $result->join('wordsalad_score', 'w', 'w.nid = n.nid');
    $result->join('W365_JournalNodeData', 'wc', 'wc.nid = n.nid');

    // Execute the query
    $studentPost = $result->execute()->fetchAll();

    // Student Post Stats
    $wordTotal = 0;  // total number of words for the entire term.
    $entryTotal = 0; // total number of entries for the entire term.
    $wordPerEntry = 0; // average words per entry.
    $wordSalad = 0; // number of WordSalad post

    // Gathering Information on student post
    foreach ($studentPost as $key => $post) {
        // Formatting Date
        if (property_exists($post, 'date')) {
            // January = 0 not 1
            $day = date('d', $post->date);
            $month = date('m', $post->date);
            $year = date('Y', $post->date);
            // Puts months in javascript date format
            // January = 0 != 1
            if ($month - 1 < 0) {
                $month = 11;
            } else {
                $month--;
            }
            // Add a 0 for months less then 10
            if ($month < 10) {
                $month = '0' . $month;
            }
            $studentPost[$key]->date = $year . '-' . $month . '-' . $day;
        }

        // Count number of WordSalad post
        if ($post->is_wordsalad) {
            $wordSalad++;
        }

        // Tallies number of entries
        $entryTotal++;

        // Totaling word count
        $wordTotal += $post->wordcount;

    }

    // Gets average words per entry
    if ($entryTotal != 0) {
        $wordPerEntry = round($wordTotal / $entryTotal, 3);
    } else { // Defaults to 0.0, if $entryTotal is 0
        $wordPerEntry = 0.0;
    }


    // Displaying Post Statistics
    $build .= '<h3 class="section-header">Student Post Statistics</h3>';

    $build .= '<div class="row-fluid">'
        . '<div class="span3"><p><strong>Word Total</strong></p><p>' . $wordTotal . '</p></div>'
        . '<div class="span3"><p><strong>Entries Total</strong></p><p>' . $entryTotal . '</p></div>'
        . '<div class="span3"><p><strong>Words/Entries</strong></p><p>' . $wordPerEntry . '</p></div>'
        . '<div class="span3"><p><strong>WorldSalad Count</strong></p><p>' . $wordSalad . '</p></div>'
        . '</div>';


    // TACAL resources
    // Loaded from Write365
    // If not installed add js load for TACAL here.

    // Custom TACAL js
    drupal_add_js(drupal_get_path('module', 'reports_registration') . '/js/student-detail.js', 'file');
    drupal_add_js(array('reportsregistration' => array('studentid' => $account->uid, 'studentpost' => json_encode($studentPost))), array('type' => 'setting'));

    // Display Div for TACAL
    // Displaying  TACAL
    $build .= '<h4 class="section-header">Streak Calendar</h4>';
    $build .= '<div id="' . $account->uid . '"></div>';

    // Displaying student post
    $build .= '<h4 class="section-header">WordSalad</h4>';
    $build .= "<p><i class=\" fa fa-exclamation-triangle fa-2x\" style=\"color:#f08080;\" title=\"Exclamation Triangle\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably not</u> structured English.<br />";
    $build .= "<i class=\" fa fa-check fa-2x\" style=\"color:#90ee90;\" title=\"Check Mark\"></i>&nbsp;&nbsp;A WordSalad value indicating that the journal entry is <u>probably</u> structured English.</p>";


    // Configure the table header columns
    $header = array(
        array('data' => 'Node Id', 'field' => 'nid'),
        array('data' => 'Title', 'field' => 'title'),
        array('data' => 'Created', 'field' => 'created', 'sort' => 'desc'),
        array('data' => 'Status', 'field' => 'is_wordsalad'),
        array('data' => 'Wordcount', 'field' => 'wordcount'),
    );

    $result->extend('TableSort')
        ->orderByHeader($header); //then use an extender to create the sorted table
    $results = $result->execute();

    // Creating rows for table
    $rows = array();

    foreach ($results as $row) {
        if ($row->is_wordsalad) {
            $wordsalad = '<i class=" fa fa-exclamation-triangle fa-2x" style="color:#f08080;" title="Exclamation Triangle"></i>';
        } else {
            $wordsalad = '<i class=" fa fa-check fa-2x" style="color:#90ee90;" title="Check Mark"></i>';
        }
        $rows[] = array(
            "nid" => $row->nid,
            "title" => "<a href='/node/" . $row->nid . "''/>" . $row->title . "</a>",
            "created" => date('F j, Y, g:i a', $row->date),
            "is_wordsalad" => $wordsalad,
            "wordcount" => $row->wordcount,
        );
    }

    $build .= theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('class' => array('write365-table'))));

    // Add the pager
    $build .= theme('pager');

    return $build;
}

