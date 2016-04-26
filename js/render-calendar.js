/**
 * Created by: Nathan Healea
 * Project: write365
 * File:
 * Date: 4/21/16
 * Time: 5:52 PM
 */

(function ($) {
    $(document).ready(function () {


        var posts = JSON.parse(Drupal.settings.writing.posts);
        console.log(posts);


        var options = {
            id: 'entry-calendar',
            event: posts,
            show: ['date','event']
        };
        var calmin = new TACAL(options);

        calmin.fullMonth();
    });

})(jQuery);