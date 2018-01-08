const logger = require("../utils/logger");
const  axios =require("axios"); 
var request = require("request");
exports.addContact = (options) => {
    return new Promise(function(resolve,reject){
         var option = {
            method : 'POST',
            url:'https://applozic.api-us1.com/admin/api.php?api_action=contact_add',
            headers:{'content-type': 'application/x-www-form-urlencoded'},
            form:{
                api_action:'contact_add',
                api_key :'79c8255584cf52a2e8c91f9ef92b7afdbde9c4cd97288797e300659032e14aa3247a638e',
                api_output:'json',
                email : options.email,
                'p[1]':'7',
                'status[1]':'1'
            }
        };
        request(option,function (error, response, data) {
            //if (error) throw new Error(error);
            if (error) {
                logger.error("error ",error);
                return reject(error);
            }else{
                logger.info("response received",data);
                return resolve(response);
            };
          });
    });
    
}


 