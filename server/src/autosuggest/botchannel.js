const  axios = require('axios');
const request = require('request');
const customerservice = require('../customer/customerService');
const config = require('../../conf/index.js');

exports.insertFaq = (data) =>
{
  var customer = customerservice.getCustomerById(data['applicationId'])
  var appkey = customer.companyName
  data['applicationKey'] ='kommunicate-support'
  var questions = data['name'].split(",")
  console.log(questions)
  data['name'] = questions

request.post(
    config.getProperties().urls.rasafaq,
    { json:data },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}
