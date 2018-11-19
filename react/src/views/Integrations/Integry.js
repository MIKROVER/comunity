import { thirdPartyList, integryThirdPartyList } from '../Integrations/ThirdPartyList';
import React, { Component } from 'react';
import Integrations from './Integrations';
import { Link } from 'react-router-dom';
import CommonUtils from '../../utils/CommonUtils';
import { createIntegrySubscription } from '../../utils/kommunicateClient'
    
function initilizeIntegry(settings) {
    if(typeof settings !='object'){
      return;  
    }
    // this function should be called after integry SDK is loaded completely
    // todo : replace hardcoded data with  settings object. 
    window.integryAppSDK.load({
        app_key: "6ab3030f-cbcc-40c0-9e89-7bf33e71a4da", // provided by Integry . 
        user_id: "1de42a6e4a0caadad66e22f694e693750",  // customer_Id kommunicate.  use applicationId here to share the integration with all agents within application 
        hash :"382c40f9703330e96e0a2d30c857a09bde41b896bd9b6b455b63e9b3143fdcc9",
        //hash: "24bee38347a2f3a39b9846ad47b2e57c34c77ac693e63f99bbad619929940a53",
        //bundle_id: "23",
        bundle_id :"32",
        bundle_instance_id: "",
        callback: integrationSuccessCallback,
        callback_render_integration_row: renderIntegrationRowCallback,
        callback_render_template_row: renderTemplateRowCallback,
        render_templates_container: 'templates',
        render_integrations_container: 'integrations',
        x_integry_configs: {
            view_container: 'intcontainer',
            view_url: '',
            app_auth: {
               // api_key: 'c690bd29-7987-4e02-8c34-09a1547477f8' // Kommunicate API key for customer. this wiil be used to access the kommunicate APIs from integry   
               "api_key":  "OTTHTvrCRR72YW93XlasZxa9UXHd9Mjx"
            }
        },
        x_custom_variables: {
           // "application_id": "23cab6b8b34de229c0aaa6add5dfc4f78"
           "application_id": "1de42a6e4a0caadad66e22f694e693750"
        }
    });
}

function integrationSuccessCallback(data) {
    // callback when integration process is finished. will be called when use click on the save button in template form.
    //in this method you can perform integration post-save actions 
    //for example you can save bundle instance id returned in your database 
   console.log("integration data ",data); 
   alert("Integration added successfully");
   let subscriptionData = {
       platform:"integry",
       apiKey:"OTTHTvrCRR72YW93XlasZxa9UXHd9Mjx",
       integrationName:"pipedrive",
       eventType:"1",
       triggerUrl:data.endpoint
   }

   createIntegrySubscription(subscriptionData).then(response => {1`1`
    console.log("db updated", response)
   })
   .catch( err => {
       console.log(err)
   })
   cancelAddNewIntegration();
}


function renderIntegrationRowCallback (integration) {
    alert("renderIntegrationRowCallback");
    // not sure if it is in use. check it 
     // console.log("callbackFunc_Render_Integration_Row")
        // var status_link = (integration.status === 'ACTIVE') ? integration.disable_link : integration.enable_link; 
        // var status_op = (integration.status === 'ACTIVE') ? 'disable' : 'enable'; 
        // var status_text = (integration.status === 'ACTIVE') ? 'Disable' : 'Enable'; 
        // var html = `<th scope="row" class="col-md-6">  
        //             <a class="media align-items-center" href="#">  
        //             <div class="media-body"> 
        //                 <span class="h6 mb-0">` + integration.name + `</span> 
        //             </div> 
        //             </a> 
        //         </th> 
        //         <td> 
        //             <a href="`+ integration.link + `" class="btn btn-success">Edit</a> 
        //         </td> 
        //         <td> 
        //             <a href="` + status_link + `" data-op="`+ status_op + `" class="btn btn-warning">` + status_text + `</a> 
        //         </td>  
        //         <td>  
        //             <a href="` + integration.delete_link + `" data-op="delete" class="btn btn-danger">Delete</a> 
        //         </td>`; 


        // var row = window.$kmApplozic('<tr class="bg-white"/>'); 
        // row.append(window.$kmApplozic.parseHTML(html)); 
        // return row; 
}   

function renderTemplateRowCallback(template) {
    // it will render the template list(available application list for integration) in the page.  
    
    console.log("callbackFunc_Render_Template_Row")
        var img = (template.branding_app && template.branding_app.icon_url) ? template.branding_app.icon_url : 'assets/img/integry-icon.png'; 
        let key = template.name.toLowerCase()         
        thirdPartyList[key] = {
            key: key,
            name: template.name,
            logo: img,
            subTitle: template.description,
            integrationType: 0,
            state: key+"Keys",
            // label :<Link to= {template.link} data-key = {key} className="integration-settings">Add</Link>,
            
            // label :<span  data-key = {key} className="integration-settings" onClick ={ function(e){addNewIntegration(template.id);e.preventDefault();e.stopPropagation();}}>Add</span>,
            
            label :"Add",
            
            docsLink: "",
            domain:"",
            instructions:["instruction1","instruction 2"],
            source:"integry",
            templateId:template.id,
            // label :<span href= {template.link} data-key = {key} target="_blank" className="integration-settings">Add</span> 
        }
        CommonUtils.triggerCustomEvent("kmIntegryInitilized",{detail:{"status": "success","list":thirdPartyList},bubbles: true,cancelable: true});
        return window.$kmApplozic('<tr>'); 
}
function addNewIntegration(templateId) {
    window.$kmApplozic(".integration-form-preview").show();
    window.integryAppSDK.renderTemplateForm(templateId);
}
function cancelAddNewIntegration() {
    window.$kmApplozic(".integration-form-preview").hide();
}

export { 
    initilizeIntegry,
    addNewIntegration 
}