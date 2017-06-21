"use strict";

var SteamlyticsAPI = require("node-steamlytics").API;
var steamlytics = new SteamlyticsAPI("", (api, account) => { // the constructor does not support promises, for obvious reasons.
    Promise.all([api.csgo.items().then((dataItems) => {
        var arrayItems = Object.keys(dataItems.items);
	       Promise.all([api.csgo.pricelist().then((dataInfo) => {
               var fs = require('fs');
               var stream = fs.createWriteStream("pricelist.txt");

               //V2 Pricelist - safe_net_price
               const max_safe_net_price = 2.00;
               const min_safe_net_price = .01;

               //V2 Pricelist - total_volume
               const max_total_volume = 2000;
               const min_total_volume = 1000;

               //V2 Pricelist - ongoing_price_manipulation
               const restrict_output = true; //If true then desired_output will output items that match JSON ongoing_price_manipulation output
               const desired_output = false;

               //V2 Pricelist - first_seen
               const lastest_time = 1465689600;

               stream.once('open', function(fd) {
                   for (var i = 0; i < arrayItems.length; i++) {
                       var item = dataItems.items[i];
                       var key = item.market_name;

                       try {
                           var value = dataInfo[key];

                           var totalVolume = value.total_volume;
                           var safePrice = value.safe_price;
                           var manip = value.ongoing_price_manipulation;
                           var firstSeen = value.first_seen;
                       }
                       catch (err)
                       {
                           continue;
                       }

                       if (totalVolume < min_total_volume || totalVolume > max_total_volume)
                       {
                           continue;
                       }
                       if (safePrice < min_safe_net_price || safePrice > max_safe_net_price)
                       {
                           continue;
                       }
                       if (restrict_output)
                       {
                           if (desired_output != manip)
                           {
                               continue;
                           }
                       }
                       if (firstSeen > lastest_time)
                       {
                           continue;
                       }
                       stream.write("Name:\"" + key + "\" | Volume:" + totalVolume + " | Price:" + safePrice + " | Manipulation:" + manip + "\n\n");
                   }
                   stream.end();
               });
	          })]).catch((err) => {
		            // Handle error
                    console.error(err.message);
	          });
        })]).catch((err) => {
                // Handle error
                console.error(err.message);
        });
});
