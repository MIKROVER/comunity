$(document).ready(function() {
  var $chat_form = $('#chat-form');
  var $chat_submit = $('#chat-submit');
  var $chat_relauncher = $('#chat-relauncher');
  var $chat_response = $('#chat-response');
  var $chat_postlaunch = $('#chat-post-launch');

  $chat_relauncher.on('click', function() {
    window.location = '/login.html';
  });

});

var autoSuggestions = {};

function initAutoSuggestions() {

  for(autoSuggest in autoSuggestions){
    $('#km-text-box').atwho({
      at: `/${autoSuggest}`,
      insertTpl: '${content}',
      displayTpl: '<li data-suggestionId="${suggestionId}">${name} <small>${content}</small></li>',
      data: autoSuggestions[autoSuggest],
      callbacks: {
        beforeInsert: function(value, $li, e) {
          var machineInput = {"text": $(".active-chat .km-msg-left .km-msg-content div").last().html(), "label": $li.attr('data-suggestionId')};
          $('#km-text-box').data("metadata", encodeURIComponent(JSON.stringify(machineInput)));
          return value;
        },
        beforeReposition: function(offset) {
          return offset;
        },
        afterMatchFailed: function(at, el) {

        }
      }  
    });
  }
}


  var $userId = "";
  var $appKey = "applozic-sample-app";
  var $contactNumber = "";
  var $password = "";
  function logout(){
    $kmApplozic.fn.applozic("logout");
  }

  function chatLogin() {
    var userSession = JSON.parse(localStorage.getItem('KM_USER_SESSION'));
    var userId = userSession.userName;
    var appId = userSession.application.applicationId;
    var userPassword = userSession.password;
    var userContactNumber = "";
    var topicBoxEnabled = true;
    var applozicBaseUrl = (window.location.origin=="http://localhost:3000"||window.location.origin=="https://dashboard-test.kommunicate.io")?"https://apps-test.applozic.com":"https://chat.kommunicate.io";
    console.log("base url",applozicBaseUrl);
    /*var displayName = '';
    displayName = '${param.displayName}';*/
    if (typeof userId === "undefined" || userId == null) {
      return;
    }

    if (userId == 'applozic' || userId == 'applozic-premium') {
        $("#km-individual-tab-title .km-tab-title").click(function () {
            clearbit($(this).text());
            //activeCampaign($(this).text());
        });
    }

    function onInitialize(data) {
      if (data.status == 'success') {
        // write your logic exectute after plugin initialize.
        $("#login-modal").mckModal('hide');
        $('#chat').css('display', 'none');
        $('#chat-box-div').css('display', 'block');
        initAutoSuggestions();
        //$("#li-chat a").trigger('click');
        window.Aside.loadAgents();
      }
    }

    $kmApplozic.fn.applozic({
      baseUrl: applozicBaseUrl,
      notificationIconLink:
          'https://dashboard.kommunicate.io/favicon.ico',
      notificationSoundLink: 'https://api.kommunicate.io/plugin/audio/notification_tone.mp3',
      userId: userId,
      appId: appId,
      //appId: 'applozic-sample-app',
      // email:'userEmail',
      accessToken: userPassword,
      desktopNotification: true,
      swNotification: true,
      messageBubbleAvator: true,
      olStatus: true,
      onInit: onInitialize,
      onTabClicked : function(tabDetail) {
            window.$kmApplozic("#km-contact-list .person").removeClass('prev-selection');

            window.appHistory.replace('/conversations');

  					if(typeof tabDetail === 'object') {
              if (tabDetail.isGroup) {
                window.$kmApplozic("#km-toolbar").removeClass('n-vis').addClass('vis');
                window.Aside.initConversation(tabDetail.tabId);
              } else {
                window.$kmApplozic("#km-toolbar").addClass('n-vis').removeClass('vis');
              }
  					}
					},
      locShare: true,
      googleApiKey: 'AIzaSyCrBIGg8X4OnG4raKqqIC3tpSIPWE-bhwI',
      launchOnUnreadMessage: true,
      topicBox: topicBoxEnabled,
      authenticationTypeId: 1,
      initAutoSuggestions : initAutoSuggestions
      // topicDetail: function(topicId) {}
    });
    return false;
  //});
  }

function activeCampaign(email) {
  $.ajax({
    url: 'https://applozic.api-us1.com/admin/api.php?api_action=contact_view&api_key=aa87aefccdb0f33344e88fc6c8764df8512427a3a84fc0431c3fed9691dab83cac9394b3&api_output=json&id=autoforosyurii@gmail.com',
    type: 'GET',
    success: function(response) {
        console.log(response);
    }
  });
}

function clearbit(email, userId) {
    //Authorization: Bearer sk_8235cd13e90bd6b84260902b98c64aba
    //https://person-stream.clearbit.com/v2/combined/find?email=alex@alexmaccaw.com
    $.ajax({
        url: 'https://person-stream.clearbit.com/v2/combined/find?email=' + email,
        type: 'GET',
        headers: {
            "Authorization":"Bearer sk_8235cd13e90bd6b84260902b98c64aba"
        },
        success: function(response) {
            displayCustInfo(response)
            console.log(response);
            var user={'userId':userId,'metadata': {'kmClearbitData' : JSON.stringify(response)}}
            window.Aside.updateApplozicUser(user);
        }
    });

}

function displayCustInfo(clearbitData) {
  var person = clearbitData.person;
  var company = clearbitData.company;
            var info = "";
  var userInfo = {};
            if (typeof person !== "undefined" && person != null && person != "null") {
                info = person.bio + " " + person.location;
    $("#km-user-info-list .bio").html(person.bio + " " + person.location);
                var employment = person.employment;
                if (typeof employment !== "undefined" && employment != null && employment != "null") {
                    info = info + " " + person.employment.title;
      $("#km-user-info-list .title").html(person.employment.title);
                }
                var linkedin = person.linkedin;
                if (typeof linkedin !== "undefined" && linkedin != null && linkedin != "null") {
                    info = info + " " + linkedin.handle;
      $("#km-user-info-list .linkedin").attr('href', 'https://linkedin.com/' + linkedin.handle);
                }
            }
            if (typeof company !== "undefined" && company != null && company != "null") {
                info = info + " " + company.domain;
    $("#km-user-info-list .domain").attr('href', 'https://www.'+company.domain);
        }
  console.log(info)
}

function getSuggestions(_urlAutoSuggest) {

  fetch(_urlAutoSuggest)
    .then(res => res.json())
    .then(response => {
      autoSuggestions_data = response.data;
      return autoSuggestions_data;
    })
    .then(autoSuggestions_data => {
      console.log(autoSuggestions_data)
      autoSuggestions = autoSuggestions_data.reduce((prev, curr) => {
          console.log(curr);
          if(curr.category in prev){
            prev[curr.category].push({suggestionId: curr.id, name:curr.name, content:curr.content})
          }else{
            prev[curr.category] = [{suggestionId: curr.id, name:curr.name, content:curr.content}]
          }
        return prev;
      }, {});
      let categories = Object.keys(autoSuggestions);
      initAutoSuggestions()
    })
    .catch(err => {console.log("Error in getting auto suggestions")});
}
