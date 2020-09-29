/**
 * Created by interdate on 30/01/2018.
 */


function setSelect2(selector,options) {
    jQuery(document).ready(function ($) {
        var select2 = jQuery(selector).select2(options);
        jQuery(selector).select2({minimumResultsForSearch: -1});

        /*{
         placeholder: "Select a state"
         }*/
        jQuery(selector).on('select2:opening', function (e) {
            // Do something
            jQuery('.bg-all').show();
            //jQuery('select').not('#countryRegionId').find(".select2-search, .select2-focusser").remove();
            //console.log(select + 'test select' + JSON.stringify(options));

        }).on('select2:close', function (e) {
            jQuery('.bg-all').hide();
        });

        jQuery('.bg-all').click(function(){select2.select2("close");});

    });

}