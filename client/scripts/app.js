// YOUR CODE HERE:
var app = {};
app.rooms = {};
app.currentRoom = undefined;
app.server = 'http://localhost:3000/classes/chatterbox';
//app.server = 'https://api.parse.com/1/classes/chatterbox';
app.init = function(){
  app.fetch(undefined);

  $(".username").on('click',function(){
    console.log("added friend");
    app.addFriend();
  });

  $('#send .submit').on('click',function(){
    console.log("sumbitted");
    app.handleSubmit();
    $('.post').remove();
    app.fetch();
  });

 $('#new').on('click', function(){
    // select all posts and remove them
    $('.post').remove();
    app.fetch(app.currentRoom);
  });

  $('#myRoom').on('input',function(e){
    app.currentRoom = $(this).val();
  });
};

app.send = function(ourPost){
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: this.server,
    type: 'POST',
    data: JSON.stringify(ourPost),
    //contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
      console.log(arguments);
    }
  });
};

app.fetch = function(currentRoom){
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: this.server,
    type: 'GET',
    success: function (data) {
      for (var i = 0; i < data.results.length; i++){
        if(data.results[i].roomname === currentRoom || currentRoom === undefined){
          app.addMessage(data.results[i]);
        }
        app.rooms[data.results[i].roomname] = data.results[i].roomname;
      }
      $('.room').remove();
      for(var room in app.rooms){
        app.addRoom(room);
      }
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get messages');
    }
  });
};

app.clearMessages = function(){
  $('#chats').children().remove();
};

app.addRoom = function(roomName){
  var $option = $('<div></div>');
  $option.text(roomName);
  $option.addClass('room');
  $option.appendTo($('#roomSelect'));

  $option.on('click', function(){
    console.log('room' + $(this).text() + 'selected')
    app.currentRoom = $(this).text();
    $('.post').remove();
    app.fetch(app.currentRoom);
    $('#myRoom').val(app.currentRoom);
  });
}

// var message = {
//  username: 'Mel Brooks',
//  text: 'Never underestimate the power of the Schwartz!',
//  roomname: 'lobby'
// };
app.addMessage = function(message){
  var $post = $('<div></div>');
  $post.addClass('post');
  
  var $username = $('<span></span>');
  $username.text(message.username);
  $username.addClass('username');
  $username.appendTo($post);
  $username.on('click',function(){
    app.addFriend.call($(this));
  });

  var $roomname = $('<span></span>');
  $roomname.text(message.roomname); 
  $roomname.addClass('roomname');
  $roomname.appendTo($post);

  var $message = $("<p></p>");
  $message.addClass('message');
  $message.text(message.text);
  $message.appendTo($post);
  
  $post.appendTo($("#chats"));
};

app.addFriend = function(){
  console.log('added friend');
  var friendName = this.text();
  $('.username').each(function(index, element){
    if ($(element).text() === friendName){
      $(element).parent().addClass('friended');
    }
  });
  
};

app.handleSubmit = function(){
  console.log('submitted');
  ourPost = {
    username: window.location.search.slice(10),
    roomname: app.currentRoom,
    text: $('textarea').val(),
  };
  app.send(ourPost);
};

$(document).ready(app.init);

// $(document).ready(function(){
//   var rooms = {};
//   var currentRoom = "default";
//   var getMessages = function(){
//     $.ajax({
//       // This is the url you should use to communicate with the parse API server.
//       url: 'https://api.parse.com/1/classes/chatterbox',
//       type: 'GET',
//       success: function (data) {
//         console.log(data);
//         for(var i = 0; i < data.results.length; i++){
//             var item = data.results[i];
//             rooms[item.roomname] = item.roomname;
          
//           if(item.roomname === currentRoom || currentRoom === "default"){
//             var $post = $('<div></div>');
//             $post.addClass('post');
            
//             var $username = $('<span></span>');
//             $username.text(item.username);
//             $username.addClass('username');
//             $username.appendTo($post);
            
//             var $time = $('<span></span>');
//             $time.text(item.createdAt); 
//             $time.addClass('time');
//             $time.appendTo($post);
            
//             var $roomname = $('<span></span>');
//             $roomname.text(item.roomname); 
//             $roomname.addClass('roomname');
//             $roomname.appendTo($post);

//             var $message = $("<p></p>");
//             $message.addClass('message');
//             $message.text(item.text);
//             $message.appendTo($post);
            
//             $post.appendTo($("#chats"));
//           }
//         }
//         // remove rooms from datalist
//         $('.room').remove();

//         // add rooms to datalist
//         for(var room in rooms){
//           var $option = $('<option>');
//           $option.attr('value', room);
//           $option.addClass('room');
//           $option.appendTo($('datalist#roomList'));
//         }
//       },
//       error: function (data) {
//         // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//         console.error('chatterbox: Failed to send message');
//       }
//     });
//   };
//   $('#new').on('click', function(){
//     // select all posts and remove them
//     $('.post').remove();
//     getMessages();
//   });

//   $('#myRoom').on('input',function(e){
//     currentRoom = $(this).val();

//     // remove rooms from datalist
//     console.log(currentRoom);
//     $('.room').remove();

//     // add rooms to datalist
//     for(var room in rooms){
//       var $option = $('<option>');
//       $option.attr('value', room);
//       $option.addClass('room');
//       $option.appendTo($('datalist#roomList'));
//     }

//     //update messages for room
//     getMessages();
//   });

//   var postMessage = function(message){
//     var ourPost = {
//       username: window.location.search.slice(10),
//       text: message,
//       room: currentRoom,
//     }

//     $.ajax({
//       // This is the url you should use to communicate with the parse API server.
//       url: 'https://api.parse.com/1/classes/chatterbox',
//       type: 'POST',
//       data: JSON.stringify(ourPost),
//       contentType: 'application/json',
//       success: function (data) {
//         console.log('chatterbox: Message sent');
//       },
//       error: function (data) {
//         // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//         console.error('chatterbox: Failed to send message');
//       }
//     });
//   }
//   $('#messageBox').keypress(function(event){
//     // if enter key is pressed
//     if (event.keyCode === 13){
//       // post message
//       postMessage($('#messageBox').val());
//     }
//   });

//   getMessages();
// });