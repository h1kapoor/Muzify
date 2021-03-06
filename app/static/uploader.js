function __log(e, data) {
  //log.innerHTML += "\n" + e + " " + (data || '');
  console.log("\n" + e + " " + (data || ''));
}
var audio_context;
var recorder;
var timer;
var mood = 'Joy';
var songs = [];
var audio = new Audio();
audio.addEventListener('ended', function(){
  if(songs.length > 0) {
    audio.src = songs.pop();
    audio.play();
  }
}, false);
var bgColors = {
  'Joy'     : 'yellow',
  'Fear'    : 'black',
  'Sadness' : 'blue',
  'Anger'   : 'red',
  'Disgust' : 'green',
};
function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  __log('Media stream created.');
  // Uncomment if you want the audio to feedback directly
  //input.connect(audio_context.destination);
  //__log('Input connected to audio context destination.');
  
  recorder = new Recorder(input);
  __log('Recorder initialised.');
}
function startRecording(button) {
  resetRecording(button)
  recorder && recorder.record();
  button.disabled = true;
  //button.nextElementSibling.disabled = false;
  timer = setTimeout(uploadBlob, 3000);
  __log('Recording...');
}
function stopRecording(button) {
  recorder && recorder.stop();
  button.disabled = true;
  //button.previousElementSibling.disabled = false;
  clearTimeout(timer);
  __log('Stopped recording.');
  
  // create WAV download link using audio data blob
  //createDownloadLink();
  //uploadBlob();

  recorder.clear();
}
function resetRecording(button) {
  $.ajax({
      type: 'DELETE',
      url: '/upload',
      processData: false,
      contentType: false
  }).done(function(data) {
      console.log(data);
  });
}

function uploadBlob() {
  recorder && recorder.exportWAV(function(blob) {
    var fd = new FormData();
    fd.append('fname', 'test.wav');
    fd.append('data', blob);
    $.ajax({
        type: 'POST',
        url: '/upload',
        data: fd,
        processData: false,
        contentType: false
    }).done(function(data) {
          console.log(data);
          if(mood !== data['mood']) {
            songs = [];
            mood = data['mood'];
            audio.src = data['preview_url'];
            audio.play();
          } else {
            if(songs.indexOf(data['preview_url']) < 0) {
              songs.push(data['preview_url']);
            }
          }
          document.getElementById('mood').innerHTML = mood;
          document.getElementById('text').innerHTML = data['text'];
          document.body.style.background = bgColors[mood];
    });
  });
  recorder && recorder.clear();
  timer = setTimeout(uploadBlob, 3000);
}



// function createDownloadLink() {
//   recorder && recorder.exportWAV(function(blob) {
//     var url = URL.createObjectURL(blob);
//     var li = document.createElement('li');
//     var au = document.createElement('audio');
//     var hf = document.createElement('a');
    
//     au.controls = true;
//     au.src = url;
//     hf.href = url;
//     hf.download = new Date().toISOString() + '.wav';
//     hf.innerHTML = hf.download;
//     li.appendChild(au);
//     li.appendChild(hf);
//     recordingslist.appendChild(li);
//   });
// }




window.onload = function init() {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    
    audio_context = new AudioContext;
    __log('Audio context set up.');
    __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    alert('No web audio support in this browser!');
  }
  
  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    __log('No live audio input: ' + e);
  });
};