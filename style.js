(function() {
  // TO DO LIST
  function _makeDelayed() {
    var timer = 0;
    return function(callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  }
  function toDoListStorage() {
    var elem = document.getElementById('todolist'),
        saveHandler = _makeDelayed();
    function save() {
      chrome.storage.sync.set({'toDoList': elem.value});
    }
    // Throttle save so that it only occurs after 1 second without a keypress.
    elem.addEventListener('keypress', function() {
      saveHandler(save, 1000);
    });
    elem.addEventListener('blur', save);
    chrome.storage.sync.get('toDoList', function(data) {
      elem.value = data.toDoList ? data.toDoList : '';
    });
  }
  toDoListStorage();
  // ------------------------------

  // TIMER ==============================================================================================================================================================================
  var timerTime = 60; // default time
  var active = false;
  displayTime(timeToString()[0], timeToString()[1]);

  function timeToString(){ // calculates minutes and seconds of timerTime
    var minutes = Math.floor(timerTime / 60);
    var seconds = Math.floor(timerTime - minutes*60);
    return [minutes,seconds] // returns array
  }
  function displayTime(minutes,seconds){ // changes numbers on html page according to input
    var minuteCount = document.getElementsByClassName("timerbox__numbers")[0].children[0];
    var secondCount = document.getElementsByClassName("timerbox__numbers")[0].children[2];
    if(minutes < 10){ // adds 0 at start of number if not 2 digits long
      minutes = "0" +minutes;
    }
    if(seconds < 10){ // adds 0 at start of number if not 2 digits long
      seconds = "0" +seconds;
    }
    minuteCount.innerHTML = minutes;
    secondCount.innerHTML = seconds;
  }
  function countDownTime(){
    displayTime(timeToString()[0], timeToString()[1]); // shows time initally
    if(timerTime == 0){ // when timer hits 0, blink colors
      var blinker = 20;
      setInterval(function () {
        if (blinker !=0){
          if (blinker %2 ==0){
            document.getElementsByClassName("timerbox__numbers")[0].style.backgroundColor = "#F44336"
            blinker--;
          } else{
            document.getElementsByClassName("timerbox__numbers")[0].style.backgroundColor = "#009688"
            blinker--;
          }
        }
      }, 150);
    } else{
      setTimeout(function () {
        if (active){
          timerTime --;
          displayTime(timeToString()[0], timeToString()[1]);
          countDownTime();
        }
      }, 1000);
      }
    }
      document.getElementsByClassName("timerbox__start")[0].onclick = function(){
        if(timerTime == 0){
          timerTime = 60;
        }
        if(!active){
          active =true;
          countDownTime();
        }

      }
      document.getElementsByClassName("timerbox__stop")[0].onclick = function(){
        active = false;
      }
      document.getElementsByClassName("timerbox__plusminus")[0].onclick = function(){
        timerTime += 30;
        active = false;
        displayTime(timeToString()[0], timeToString()[1]);
      }
      document.getElementsByClassName("timerbox__plusminus")[1].onclick = function(){
        if(timerTime>=30){
          timerTime -= 30;
        } else if (timerTime<30) {
          timerTime =0;
        }
        active = false;
        displayTime(timeToString()[0], timeToString()[1]);
      }
      document.getElementsByClassName("timerbox__presets--25min")[0].onclick=function(){
        timerTime = 1500;
        active = false;
        displayTime(timeToString()[0], timeToString()[1]);
      }
      document.getElementsByClassName("timerbox__presets--5min")[0].onclick=function(){
        timerTime = 300;
        active = false;
        displayTime(timeToString()[0], timeToString()[1]);
      }
      document.getElementsByClassName("timerbox__presets--1min")[0].onclick=function(){
        timerTime = 60;
        active = false;
        displayTime(timeToString()[0], timeToString()[1]);
      }

      //==============================================================================================================================================================================
      // TOOLBAR =====================================================================================================================================================================
      var timerIcon = document.getElementsByClassName("toolbar__icons--timer")[0];

      timerIcon.onclick = function(){ // Timer icon click event
        if (document.getElementsByClassName("timerbox")[0].style.display != "block"){
          document.getElementsByClassName("timerbox")[0].style.display = "block";
        }else{
          document.getElementsByClassName("timerbox")[0].style.display = "none";
        }
      }
      timerIcon.onmouseover = function(){
        if(document.getElementsByClassName("timerbox")[0].style.display == "block"){
        } else{
          var tooltipWrap = document.createElement("div"); //creates div
          tooltipWrap.className = 'tooltip'; //adds class
          tooltipWrap.appendChild(document.createTextNode("Timer")); //add the text node to the newly created div.
          document.body.appendChild(tooltipWrap);
          tooltipWrap.style.top = "40px";
          tooltipWrap.style.right = "100px";
        }

      }
      timerIcon.onmouseout = function(){
        if (document.getElementsByClassName("tooltip")[0]){
          document.getElementsByClassName("tooltip")[0].parentNode.removeChild(document.getElementsByClassName("tooltip")[0]);

        }
      }


      //==============================================================================================================================================================================
      // NOTEPADS==============================================================================================================================================================================




      function notepadStorage() {
        // note pad name
        var noteName = document.getElementsByClassName("notepad-name")[0], saveHandler = _makeDelayed();
        var noteText = document.getElementsByClassName("notepad-text")[0], saveHandler = _makeDelayed();

        function save() {
          chrome.storage.sync.set({'noteName': noteName.value, 'noteText':noteText.value});
        }
        // Throttle save so that it only occurs after 1 second without a keypress.
        noteName.addEventListener('keypress', function() {
          saveHandler(save, 1000);
        });
        noteText.addEventListener('keypress', function() {
          saveHandler(save, 1000);
        });
        noteName.addEventListener('blur', save);
        noteText.addEventListener('blur', save);
        chrome.storage.sync.get('noteName', function(data) {
          noteName.value = data.noteName ? data.noteName : '';
        });
        chrome.storage.sync.get('noteText', function(data) {
          noteText.value = data.noteText ? data.noteText : '';
        });
      }
      notepadStorage();



      //==============================================================================================================================================================================
})();
