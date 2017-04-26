var textEditor = document.getElementById('texteditor');
var textEditorDocument = textEditor.contentWindow.document;
textEditorDocument.designMode="on";
textEditorDocument.close();
var textEditorHead = textEditor.contentDocument.getElementsByTagName("head")[0];
var link = document.createElement('link');
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", "newtab.css");
textEditorHead.appendChild(link);
textEditor.contentDocument.getElementsByTagName("body")[0].className = "textEditorBody";


// user keypress listener function
textEditor.contentWindow.onkeydown = function(e) { // When user types
        e = e || window.event;
        if(e.metaKey == true && e.keyCode == 188){ // if cmd+, is pressed (h1)
          textEditorDocument.execCommand("formatBlock", false, "h1");
          e.preventDefault();
        } else if (e.metaKey && e.keyCode == 190){ // if cmd+. is pressed (h2)
          textEditorDocument.execCommand("formatBlock", false, "h2");
          e.preventDefault();
        } else if (e.metaKey && e.keyCode == 191){ // if cmd+/ is pressed change to <p></p>
          textEditorDocument.execCommand("formatBlock", false, "p");
          e.preventDefault();
        } else if (e.metaKey && e.keyCode == 85){ // if cmd + u is pressed, toggle underline
          textEditorDocument.execCommand("underline", false, null);
        } else if (e.keyCode == 27){ // if ESC is pressed, when texteditor is being used, then also removeCurrentlyShown toolbar window
          if(currentlyShown[0] == true){
            removeCurrentlyShown();
          }
        }
};
// catch ESC being pressed if window is not selected:
document.onkeydown = function(e) {
  e = e || window.event;
  if (e.keyCode == 27) {
    if(currentlyShown[0] == true){
      removeCurrentlyShown();
    }
  }
};
textEditor.contentWindow.addEventListener("paste", function(e) { // intercept paste so that only text is entered
    // cancel paste
    e.preventDefault();
    // get text representation of clipboard
    var text = e.clipboardData.getData("text");
    // insert text manually
    textEditorDocument.execCommand("insertHTML", false, text);
});

// Set automatic focus to the text area on page load
textEditor.focus();

// store, save and prepare text in the main texteditor section
function textEditorStorage(){
  var saveHandler = _makeDelayed();
  var textEditorContents = textEditorDocument.getElementsByClassName('textEditorBody')[0].innerHTML;
  
  function save() {
      chrome.storage.sync.set({'textEditor': textEditorDocument.getElementsByClassName('textEditorBody')[0].innerHTML});
    }
  // Throttle save so that it only occurs after 1 second without a keypress.
    textEditor.contentWindow.addEventListener('keypress', function() {
      saveHandler(save, 300);
    });

     textEditor.addEventListener('blur', save);

    chrome.storage.sync.get('textEditor', function(data) {
      textEditorDocument.getElementsByClassName('textEditorBody')[0].innerHTML = data.textEditor ? data.textEditor : '';
      if(textEditorDocument.getElementsByClassName('textEditorBody')[0].innerHTML == ""){
        textEditorDocument.getElementsByClassName('textEditorBody')[0].innerHTML = "<h1 style='text-align: center;'><u>Welcome to <i style='color:#03A9F4'>Notetab</i>!</u></h1><div>Anything you type here will be synced with Chrome.</div><div>The toolbar on the right has a timer and notepads.</div><div>Change theme in the settings or toggle background images.</div><div><br></div><div>Check the Github for future updates and features:&nbsp;</div><div><u style='color:#03A9F4'>https://github.com/nicklascook/Notetab</u></div><div><br></div><h1><u>Features:</u></h1><div>Header: <b>\u2318 ' , '</b></div><div>Subheader: <b>\u2318 ' . '</b></div><div>Normal Text: <b>\u2318 ' / '</b></div><div><br></div><div><b>Bold:</b><b>\u2318B</b></div><div><u>Underline:</u><span style='font-size: 26px;'> </span><span style='font-size: 26px;'>\u2318U</span></div><div><i>Italics:</i><span style='font-size: 26px;'>\u2318I</span></div>"
      }
      // If on previous version (>1.3) then add old data to new text editor, save, then change storage to undefined.
      // can be deleted after adequate time has passed ( 1-2 weeks)
    setTimeout(function(){
      chrome.storage.sync.get('toDoList', function(data){
        if(data.toDoList != undefined){
          textEditorDocument.getElementsByClassName('textEditorBody')[0].innerHTML += data.toDoList;
          saveHandler(save, 300);
           chrome.storage.sync.set({'toDoList': undefined});
        }
      })
    },0)
    });
}

textEditorStorage();
  // test


  function _makeDelayed() {
    var timer = 0;
    return function(callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  }

  function fadeIn(elem){
    var opacityCount = 0;
    elem.style.opacity = 0;
    elem.style.display = "block";
    var id = setInterval(function(){
      if(opacityCount<1){
        opacityCount += 0.1;
        elem.style.opacity = opacityCount;
      }else{
        clearInterval(id);
      }
    },15)
  }
   function fadeOut(elem){
    var opacityCount = 1;
    elem.style.opacity = 1;
    var id = setInterval(function(){
      if(opacityCount>0){
        opacityCount -= 0.1;
        elem.style.opacity = opacityCount;
      }else{
        clearInterval(id);
        elem.style.display = "none";
      }
    },15)
  }


  // // TIMER ==============================================================================================================================================================================
  var timerTime = 60; // default time
  var active = false;
  var maintainCount = false;
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
      active =false;
      setTimeout(function () {
        var audio = new Audio('alarm_sound.mp3');
        audio.play();
        setTimeout(function() {
          document.getElementsByClassName('timerbox__backdisplay')[0].style.height = "100%";
        }, 0);
        
      }, 0);
    } else{

      setTimeout(function () {
        if (active){
          timerTime --;
          displayTime(timeToString()[0], timeToString()[1]);
          countDownTime();
          reduceBackdisplayHeight();;
        }
      }, 1000);
      }
    }
    var heightTracker = 100;
    var backdisplay = document.getElementsByClassName('timerbox__backdisplay')[0];
    function reduceBackdisplayHeight(){
      var reduceCount = 0;
      var id = setInterval(function() {
        if(!active){
          clearInterval(id);
          setTimeout(function () {
              document.getElementsByClassName('timerbox__backdisplay')[0].style.height = "100%";
            }, 0);
          if(!maintainCount){
            setTimeout(function () {
              document.getElementsByClassName('timerbox__backdisplay')[0].style.height = "100%";
            }, 0);
          }
        }
        if(reduceCount == 100){
            clearInterval(id);
            setTimeout(function () {
              document.getElementsByClassName('timerbox__backdisplay')[0].style.height = "100%";
            }, 0);

        }else{
          backdisplay.style.height = heightTracker - (heightReductionIncrement/97) +"%";
          heightTracker -= (heightReductionIncrement/97);
          reduceCount++;
        }
      }, 10)


    }
      document.getElementsByClassName("icon-play_arrow")[0].onclick = function(){
        if(timerTime == 0){
          timerTime = 60;
        }
        if(!active){
          if (maintainCount){
            active =true;
            countDownTime();
          } else{
            maintainCount = true;
            active =true;
            countDownTime();
            document.getElementsByClassName('timerbox__backdisplay')[0].style.height = "100%";
            heightTracker = 100;
            heightReductionIncrement = 100/timerTime;
          }

          document.getElementsByClassName("icon-play_arrow")[0].style.display = "none";
          document.getElementsByClassName("icon-pause")[0].style.display = "block";
        }


      }
      document.getElementsByClassName("icon-pause")[0].onclick = function(){
        active = false;
        document.getElementsByClassName("icon-play_arrow")[0].style.display = "block";
        document.getElementsByClassName("icon-pause")[0].style.display = "none";
      }
      document.getElementsByClassName("timerbox__reset")[0].onclick = function(){
        maintainCount = false;
        active = false;
        timerTime = 0;
        displayTime(timeToString()[0], timeToString()[1]);
        document.getElementsByClassName("icon-play_arrow")[0].style.display = "block";
        document.getElementsByClassName("icon-pause")[0].style.display = "none";

      }
      document.getElementsByClassName("timerbox__plusminus")[0].onclick = function(){
          maintainCount = false;
          timerTime += 30;
          active = false;
          displayTime(timeToString()[0], timeToString()[1]);
          document.getElementsByClassName("icon-play_arrow")[0].style.display = "block";
          document.getElementsByClassName("icon-pause")[0].style.display = "none";

      }
      document.getElementsByClassName("timerbox__plusminus")[1].onclick = function(){
        maintainCount = false;
        if(timerTime>=30){
          timerTime -= 30;
        } else if (timerTime<30) {
          timerTime =0;
        }
        document.getElementsByClassName("icon-play_arrow")[0].style.display = "block";
        document.getElementsByClassName("icon-pause")[0].style.display = "none";
        active = false;
        displayTime(timeToString()[0], timeToString()[1]);
      }
  //
  //     //==============================================================================================================================================================================
  //     // TOOLBAR =====================================================================================================================================================================

      /*
      HOW IT WORKS: GLOBAL VARIABLE DETERMINES WHETHER OR NOT AN 'ADDITIONAL' WINDOW IS CURRENTLY DISPLAYED, IF IT IS, THE BUTTON THEN
      HIDES THAT WINDOW AND SHOWS THE CORRECT ONE.
      */
      var currentlyShown = [false,""];
      function addToCurrentlyShown(classidentifier){
        fadeIn(document.getElementsByClassName(classidentifier)[0]);
        // document.getElementsByClassName(classidentifier)[0].style.display = "block";
        currentlyShown = [true, classidentifier];
      }
      function removeCurrentlyShown(){
        fadeOut(document.getElementsByClassName(currentlyShown[1])[0]);
        // document.getElementsByClassName(currentlyShown[1])[0].style.display = "none";
        currentlyShown = [false,""];
      }

      
      var bookmarkToggle = document.getElementsByClassName("bookmarktoggle")[0].parentNode;
      bookmarkToggle.onclick = function(){ // bookmark toggle icon click event
        if(currentlyShown[0]==false){
          addToCurrentlyShown("createbookmark");
          document.getElementsByClassName('createbookmark__button'[0].style.color = "white");
        } else if (currentlyShown[0] == true && currentlyShown[1] != "createbookmark") {
          removeCurrentlyShown();
          addToCurrentlyShown("createbookmark");
        }else if(currentlyShown[0] == true && currentlyShown[1] == "createbookmark"){
          removeCurrentlyShown();
        }
      }



      var timerIcon = document.getElementsByClassName("toolbar__icons--timer")[0];
      timerIcon.onclick = function(){ // Timer icon click event
        if(currentlyShown[0]==false){
          addToCurrentlyShown("timerbox");
        } else if (currentlyShown[0] == true && currentlyShown[1] != "timerbox") {
          removeCurrentlyShown();
          addToCurrentlyShown("timerbox");
        }else if(currentlyShown[0] == true && currentlyShown[1] == "timerbox"){
          removeCurrentlyShown();
        }
      }

      // tooltip for timer
      timerIcon.onmouseover = function(){ // Timer icon tooltip on mouseover
        if(document.getElementsByClassName("timerbox")[0].style.display == "block"){
        } else{
          var tooltipWrap = document.createElement("div"); //creates div
          tooltipWrap.className = 'tooltip'; //adds class
          tooltipWrap.appendChild(document.createTextNode("Timer")); //add the text node to the newly created div.
          document.body.appendChild(tooltipWrap);
          tooltipWrap.style.top = "95px";
          tooltipWrap.style.right = "100px";
        }

      }
      timerIcon.onmouseout = function(){ // Timer icon tooltip on mouseout
        if (document.getElementsByClassName("tooltip")[0]){
          document.getElementsByClassName("tooltip")[0].parentNode.removeChild(document.getElementsByClassName("tooltip")[0]);
        }
      }

      // tooltip for add button

      var addIcon = document.getElementsByClassName("toolbar__icons--add")[0];
      addIcon.onmouseover = function(){ // Timer icon tooltip on mouseover
          var tooltipWrap = document.createElement("div"); //creates div
          tooltipWrap.className = 'tooltip'; //adds class
          tooltipWrap.appendChild(document.createTextNode("Add notepad")); //add the text node to the newly created div.
          document.body.appendChild(tooltipWrap);
          tooltipWrap.style.top = "140px";
          tooltipWrap.style.right = "100px";
      }
      addIcon.onmouseout = function(){ // add icon tooltip on mouseout
        if (document.getElementsByClassName("tooltip")[0]){
          document.getElementsByClassName("tooltip")[0].parentNode.removeChild(document.getElementsByClassName("tooltip")[0]);
        }
      }

      // tooltip for settings button
      var settingsIcon = document.getElementsByClassName("toolbar__icons--settings")[0];
      settingsIcon.onmouseover = function(){ // Timer icon tooltip on mouseover
          var tooltipWrap = document.createElement("div"); //creates div
          tooltipWrap.className = 'tooltip'; //adds class
          tooltipWrap.appendChild(document.createTextNode("Settings")); //add the text node to the newly created div.
          document.body.appendChild(tooltipWrap);
          tooltipWrap.style.top = "30px";
          tooltipWrap.style.right = "100px";
      }
      settingsIcon.onmouseout = function(){ // add icon tooltip on mouseout
        if (document.getElementsByClassName("tooltip")[0]){
          document.getElementsByClassName("tooltip")[0].parentNode.removeChild(document.getElementsByClassName("tooltip")[0]);
        }
      }




      document.getElementsByClassName("toolbar__icons--add")[0].onclick = function(){ // Add notepad icon functionality
        if(currentlyShown[0]==false){
          addToCurrentlyShown("createnotepad");
        } else if (currentlyShown[0] == true && currentlyShown[1] != "createnotepad") {
          removeCurrentlyShown();
          addToCurrentlyShown("createnotepad");
        }else if(currentlyShown[0] == true && currentlyShown[1] == "createnotepad"){
          removeCurrentlyShown();
        }
      }

      // settings onclick functionality
      document.getElementsByClassName("toolbar__icons--settings")[0].onclick = function(){
        if(currentlyShown[0]==false){
          addToCurrentlyShown("settings");
        } else if (currentlyShown[0] == true && currentlyShown[1] != "settings") {
          removeCurrentlyShown();
          addToCurrentlyShown("settings");
        }else if(currentlyShown[0] == true && currentlyShown[1] == "settings"){
          removeCurrentlyShown();
        }
      }



      // settings theme functionality
      var currentTheme = "";
      function findTheme(){
        chrome.storage.sync.get("theme", function(data){
          if(data.theme == undefined){
            chrome.storage.sync.set({"theme":"dark"});
          }
            currentTheme = data.theme;
        })
      }
      function switchTheme(){
        var theme = currentTheme;

        if (theme == "light"){
          chrome.storage.sync.set({"theme":"light"});
          document.getElementsByClassName('container')[0].classList.add("container--lighttheme");
          document.getElementsByClassName('settings__theme--light')[0].classList.add("settings__theme--active");
          document.getElementsByClassName('settings__theme--dark')[0].classList.remove("settings__theme--active");
          textEditor.contentDocument.getElementsByTagName("body")[0].classList.add("lighttheme");
          setTimeout(function() {
            for(var i=0; i<document.getElementsByClassName("notepad-text").length;i++){
            document.getElementsByClassName("notepad-text")[i].contentDocument.getElementsByTagName("body")[0].classList.add("noteEditorBody--lighttheme");
            }
          }, 200);
          
          
        } else if (theme == "dark") {
          chrome.storage.sync.set({"theme":"dark"});
          if(document.getElementsByClassName('container')[0].classList.contains("container--lighttheme")){
            document.getElementsByClassName('container')[0].classList.remove("container--lighttheme");
            textEditor.contentDocument.getElementsByTagName("body")[0].classList.remove("lighttheme");
            for(var i=0; i<document.getElementsByClassName("notepad-text").length;i++){
            document.getElementsByClassName("notepad-text")[i].contentDocument.getElementsByTagName("body")[0].classList.remove("noteEditorBody--lighttheme");
            }
          }
          document.getElementsByClassName('settings__theme--light')[0].classList.remove("settings__theme--active");
          document.getElementsByClassName('settings__theme--dark')[0].classList.add("settings__theme--active");
        }
      }
      setTimeout(function() {
        switchTheme(findTheme());
      },100);
      
      document.getElementsByClassName('settings__theme--light')[0].onclick = function(){
        currentTheme = "light";
        chrome.storage.sync.set({"theme":"light"});
        switchTheme();
      }
      document.getElementsByClassName('settings__theme--dark')[0].onclick = function(){
        currentTheme = "dark";
        chrome.storage.sync.set({"theme":"dark"});
        switchTheme()
      }

      // changes the background to an image from the array imgurImages
       function randomBackgroundImage(){
        var imgurImages =["7yOB0Gw", "iMt9E","9uUjGxZ","54deiOy","6dfIT0V","Wj6acBM","F3MrDRB","P6XwfBF","uYPLPth","tuhylfj","IhVFz","5Gbmza1","Si7YKS9","YMRoa","RHADN","dLjcZUA","OK69cgs","IKWu7","dZIRDmC","EVMuBcO","dV3PFYf","vWqGbB4","2O1EXxo","fLJX6z7","GEzJfcm"];
        var randomImageNumber = Math.floor(Math.random()*(imgurImages.length));
        document.getElementsByClassName('container')[0].style.backgroundImage = "url(https://i.imgur.com/"+imgurImages[randomImageNumber] +".jpg)"; // adds .jpg to code + imgur link
      }
  
    
      // global variable to track the image checkbox state
      var imageCheckbox = document.getElementById('imagecheckbox');
      var imageCheckboxOn = true;
      // find whether the checkbox is on or not, if not in storage, then set it to default: true
      function findBackgroundProperty(){
        chrome.storage.sync.get("bgImage", function(data){ // check the storage.sync
          if(data.bgImage == undefined){ // if not currently set, make it true
            chrome.storage.sync.set({"bgImage":true})
          }
            imageCheckboxOn = data.bgImage; // change the imageCheckbuttonOn property to the result from storage
            if(data.bgImage){
              imageCheckbox.checked = true;
              textEditorDocument.getElementsByClassName('textEditorBody')[0].style.color = "white";
            }
          
        })
      }
      
      function runBackgroundChange(){ // check if imagecheckboxon is false,
        setTimeout(function(){
          if(imageCheckboxOn == true){
           randomBackgroundImage();
        }
        },0)
      }
      // background image check:
      
      imageCheckbox.onclick = function(){
        if(imageCheckbox.checked !== true){ // if checkbox is 
          chrome.storage.sync.set({"bgImage":false});
          imageCheckboxOn = false;
          document.getElementsByClassName('container')[0].style.backgroundImage = "none";
          if(currentTheme == "light"){
            textEditorDocument.getElementsByClassName('textEditorBody')[0].style.color = "#1f364d";
          }
        } else{
          chrome.storage.sync.set({"bgImage":true});
          imageCheckboxOn = true;
          randomBackgroundImage();
          if(currentTheme == "light"){
            textEditorDocument.getElementsByClassName('textEditorBody')[0].style.color = "white";
          }
        }
      };
      
      // Theme and Background image check:
      setTimeout(function () {
        findBackgroundProperty();
        runBackgroundChange();
        findTheme();
        switchTheme();
      },70);





      //==============================================================================================================================================================================
      // NOTEPADS==============================================================================================================================================================================
      //
      var notepadColors = {"white":"#fff","blue":"#3F51B5","red":"#f44336","purple":"#9C27B0","green":"#4CAF50","yellow":"#FF9800","teal":"#009688"};
      //

      /* Adding a new notepad -> Check which notes are currently not in use, if all 5 are used up -> give error
                              ----> chrome.storage.sync.set the values given --> run createNotepadOnPage
      */
      document.getElementsByClassName("createnotepad__settings--button")[0].onclick = function(){
        if(document.getElementsByClassName("createnotepad-name")[0].value != ""){ // if field not blank:
          findNotesInUse(); // refresh array
          setTimeout(function () {
          if(notesInUse.length >= 5){ // if there arent more than 5 notes already
            alert("Too many notes in use, please remove one to create another");
            
          } else{
            setTimeout(function(){
              removeCurrentlyShown(); // remove any open menus as note has been created successfully
              
              // find which note to create:
              for(var i=1; i<=5;i++){ // loop through 1-5
                if(notesInUse.includes("note"+i) === false){ // the first note that is not already made
                  var noteToCreate = "note"+i; // add variable to store the note to be created
                  var noteNameFromInput = document.getElementsByClassName("createnotepad-name")[0].value; // get input name
                  var save = {}; // create save variable to transfer to sync.set
                  save[noteToCreate] = {"noteName":noteNameFromInput, 'noteText':""}; // create object from note + i

                  chrome.storage.sync.set(save, function() { // save to storage.sync
                  });
                  createNotepadOnPage(noteToCreate); // create the notepad

                  break; // break the for loop cycle
                }
              };
              document.getElementsByClassName("createnotepad-name")[0].value="";

            },0)}},50);
        } else{
          alert("Please enter a notepad name")
        }
      }

      var notesInUse = [];
      function findNotesInUse(){ // searches through notes1-5 and if they appear in storage, pushes them to the notesInUse array
        notesInUse = []; // reset notesInUse array
        chrome.storage.sync.get(function(data){
          setTimeout(function() {
            for(var i=1; i<=5; i++){
              if( data["note"+i] !== undefined){
                  notesInUse.push("note"+i);
              }
            }
          }, 0);
        })
      }
      
      findNotesInUse(); // create array of used notes
      function parseUsedNotes(){ // parses through the string names of the notes that appear in the notesInUse array to the create function
        for(var i=1; i<=5;i++){
          if(notesInUse.includes("note"+i)){
            createNotepadOnPage("note"+i)
          }
        }
        
      }

      setTimeout(function () {
        parseUsedNotes();
      }, 100);

      function createNotepadOnPage(name){ // creates a notepad given the name (note1 etc.)

        chrome.storage.sync.get(function(data){ // .gets from sync storage
          // create toolbar icon
            var newNote = document.createElement('span');
            newNote.className = ("toolbar__icons--notebook icon-event_note " +name);
            for(var k=1;k<=5;k++){
              if("note"+k == name){
                var matchColors = ["blue","red","purple","green","yellow"];
                var matchColor = matchColors[k-1];
                var noteCol = notepadColors[matchColor];
              }
            }
            newNote.style.boxShadow = "inset 0px 0px 0px 100px"+noteCol;
            document.getElementsByClassName("toolbar__icons")[0].appendChild(newNote);


          // create actual div:
            var note = document.createElement('div'); // create main 'notepad' div
            var divIdentifier = name + "div";
            note.className = ("notepad " + divIdentifier);
            var noteName = document.createElement('div'); // create notepad__name
            noteName.className = ("notepad__name");
            var noteNameInput = document.createElement('input');
            noteNameInput.type = "text";
            noteNameInput.className = "notepad-name " +name +"name";
            noteNameInput.value = data[name].noteName ? data[name].noteName : ''; // insert notepad__name value

            noteName.appendChild(noteNameInput);
            note.appendChild(noteName); // append notepad__name

            var notepadText = document.createElement('div'); // create notepad__textarea div
            notepadText.className = ("notepad__textarea");
            noteName.style.backgroundColor = noteCol;
            noteNameInput.style.backgroundColor = noteCol;

            var notepadTextarea = document.createElement('iframe');
            notepadTextarea.id = name+"editor";
            notepadTextarea.className = ("notepad-text " +name +"text");
            setTimeout(function() {
              var noteEditor = document.getElementById(name+"editor");
              var noteEditorDocument = noteEditor.contentWindow.document;
              noteEditorDocument.designMode="on";
              noteEditorDocument.close();
              var noteEditorHead = noteEditor.contentDocument.getElementsByTagName("head")[0];
              var link = document.createElement('link');
              link.setAttribute("rel", "stylesheet");
              link.setAttribute("type", "text/css");
              link.setAttribute("href", "newtab.css");
              noteEditorHead.appendChild(link);
              noteEditor.contentDocument.getElementsByTagName("body")[0].className = "noteEditorBody";
              // user keypress listener function
              noteEditor.contentWindow.onkeydown = function(e) { // When user types
                e = e || window.event;
                if(e.metaKey == true && e.keyCode == 188){ // if cmd+, is pressed (h1)
                  noteEditorDocument.execCommand("formatBlock", false, "h1");
                  e.preventDefault();
                } else if (e.metaKey && e.keyCode == 190){ // if cmd+. is pressed (h2)
                  noteEditorDocument.execCommand("formatBlock", false, "h2");
                  e.preventDefault();
                } else if (e.metaKey && e.keyCode == 191){ // if cmd+/ is pressed change to <p></p>
                  noteEditorDocument.execCommand("formatBlock", false, "p");
                  e.preventDefault();
                } else if (e.metaKey && e.keyCode == 85){ // if cmd + u is pressed, toggle underline
                  noteEditorDocument.execCommand("underline", false, null);
                } else if (e.keyCode == 27){ // if ESC is pressed, when texteditor is being used, then also removeCurrentlyShown toolbar window
                  if(currentlyShown[0] == true){
                    removeCurrentlyShown();
                  }
                }
              };
              noteEditorDocument.getElementsByTagName('body')[0].innerHTML = data[name].noteText ? data[name].noteText : ''; // insert notepad__textarea value
             

            }, 0); // end timeout
            
            
            notepadText.appendChild(notepadTextarea);
            note.appendChild(notepadText);

            var deleteBtn = document.createElement('span');
            deleteBtn.className = "notepad__deletebtn icon-delete";
            note.appendChild(deleteBtn);
            document.getElementsByClassName('container')[0].appendChild(note); // append the notepad div.


            newNote.onclick = function(){ // add show/hide onclick function
              if(currentlyShown[0]==false){
                addToCurrentlyShown(divIdentifier);
              } else if (currentlyShown[0] == true && currentlyShown[1] != divIdentifier) {
                removeCurrentlyShown();
                addToCurrentlyShown(divIdentifier);
              }else if(currentlyShown[0] == true && currentlyShown[1] == divIdentifier){
                removeCurrentlyShown();
              }
            }

            newNote.onmouseover = function(){ // create the  icon tooltip on mouseover
                var tooltipWrap = document.createElement("div"); //creates div
                tooltipWrap.className = 'tooltip'; //adds class
                tooltipWrap.style.backgroundColor = noteCol;
                function checkForChange(){
                  chrome.storage.sync.get(name, function(data){
                    setTimeout(function () {

                      tooltipWrap.appendChild(document.createTextNode(data[name].noteName)); //add the text node to the newly created div.
                    }, 0);
                  })
                }
                checkForChange();
                setTimeout(function () {
                  document.body.appendChild(tooltipWrap);
                  var nrNotepads = document.getElementsByClassName('toolbar__icons--notebook');
                  for(var i=0; i<nrNotepads.length;i++){
                    if(nrNotepads[i].classList.contains(name)){
                      var top = 0 + (i+1)*50;
                    }
                  }
                  tooltipWrap.style.top = (146 + top)+"px";
                  tooltipWrap.style.right = "100px";
                }, 10);



            }
            newNote.onmouseout = function(){ //  icon tooltip on mouseout
              setTimeout(function () {
                if (document.getElementsByClassName("tooltip")[0]){
                  document.getElementsByClassName("tooltip")[0].parentNode.removeChild(document.getElementsByClassName("tooltip")[0]);
                }
              }, 0);
            }

            deleteBtn.onclick= function(){
              deleteNote(name);
            }

            // ensure that the information is then stored in chrome.storage.sync
            notepadStorage(name);

        })
      }

      function notepadStorage(name) {
        // note pad name
        var noteName = document.getElementsByClassName(name + "name")[0], saveHandler = _makeDelayed();
        var noteText = document.getElementById(name + "editor"), saveHandler = _makeDelayed();

        function save() { // function to save data
          var saveData = {}; // create save variable to transfer to sync.set
          saveData[name] = {"noteName":noteName.value, 'noteText': noteText.contentWindow.document.getElementsByTagName("body")[0].innerHTML}; // create object from note name
          chrome.storage.sync.set(saveData); // save to storage
        }
        // Throttle save so that it only occurs after 300ms without a keypress.
        noteName.addEventListener('keypress', function() {
          saveHandler(save, 300);
        });
        noteText.contentWindow.document.addEventListener('keypress', function() {
          saveHandler(save, 300);
        });
        noteName.addEventListener('blur', save);
        noteText.contentWindow.document.addEventListener('blur', save);

        
    
      }

      function deleteNote(notename){
        chrome.storage.sync.remove(notename); // clear out any storage
        document.getElementsByClassName(notename)[0].parentNode.removeChild(document.getElementsByClassName(notename)[0]); // remove icon from toolbar
        document.getElementsByClassName(notename+"div")[0].parentNode.removeChild(document.getElementsByClassName(notename+"div")[0]); // remove div itself
        if(currentlyShown[1] == notename+"div" ){ // reset value of currently shown menu
          currentlyShown = [false,""];
        }
      }




var bookmarksArray = [];
function findCurrentBookmarks(){
  bookmarksArray = [];
  chrome.storage.sync.get(function(data){
    setTimeout(function() {
       console.log(data.bookmarks);
      if(data.bookmarks != undefined){
        bookmarksArray = data.bookmarks;
        removeOldBookmarkElements();
        createBmarkItems();
        createBmarkLinks();
      }
    }, 0);
  })
}
function removeOldBookmarkElements(){
  // remove old links:
        if(document.getElementsByClassName('bookmarks')[0].childNodes.length > 2){
          while(document.getElementsByClassName('bookmarks')[0].childNodes.length >= 3){
            document.getElementsByClassName('bookmarks')[0].removeChild(document.getElementsByClassName('bookmarks')[0].lastChild);
          }
        }
        if(document.getElementsByClassName('createbookmark__list')[0].children.length > 0){
          while(document.getElementsByClassName('createbookmark__list')[0].childNodes.length > 0){
            document.getElementsByClassName('createbookmark__list')[0].removeChild(document.getElementsByClassName('createbookmark__list')[0].lastChild);
          }
        }
}
function createBmarkItems(){
  for(var i = 0; i<bookmarksArray.length; i++){
    var itemDiv = document.createElement("div");
    itemDiv.className = "row item";
    var linkH3 = document.createElement('h3');
    linkH3.appendChild(document.createTextNode(bookmarksArray[i]));
    var deleteSpan = document.createElement("span");
    deleteSpan.className = "icon-cancel";

    deleteBookmarkOnclick(deleteSpan,bookmarksArray[i]);
    itemDiv.appendChild(linkH3);
    itemDiv.appendChild(deleteSpan);
    document.getElementsByClassName("createbookmark__list")[0].appendChild(itemDiv);
  }
}
function deleteBookmarkOnclick(elem,url){
  elem.onclick = function(){
    removeBookmark(url);
    setTimeout(function() {
      findCurrentBookmarks();
    }, 0);
  }
}
function removeBookmark(url){
    chrome.storage.sync.get(["bookmarks"], function(data) {
        var array = data["bookmarks"]?data["bookmarks"]:[];
        
        for (var i=array.length-1; i>=0; i--) {
            if (array[i] === url) {
                array.splice(i, 1);
            }
        }
        
        var jsonObj = {};
        jsonObj["bookmarks"] = array;
        chrome.storage.sync.set(jsonObj);
    });
}
function createBmarkLinks(){
  for(var i = 0; i<bookmarksArray.length; i++){
      var link = document.createElement("a");
      link.href = "http://"+ bookmarksArray[i];
      var img = document.createElement("img");
      img.src = "https://logo.clearbit.com/http:/" + bookmarksArray[i]+"?size=40";

      link.appendChild(img);
      imageOnError(img, bookmarksArray[i]);
      document.getElementsByClassName("bookmarks")[0].appendChild(link);
    
  }
}
function imageOnError(image, url){
  image.onerror = function(){
    
    var circleImg = document.createElement('div');
    circleImg.className = "bookmark-placeholder";
    if(url.substring(0,4) == "www."){
      circleImg.innerHTML = url.charAt(4);
    } else{
      circleImg.innerHTML = url.charAt(0);
    }
    image.parentNode.appendChild(circleImg);
    image.parentNode.removeChild(image);
    var matchColors = ["blue","red","purple","green","yellow"];
    circleImg.style.backgroundColor = notepadColors[matchColors[Math.floor(Math.random()*6)]];
    
    

    
  }
  
}

setTimeout(function() {
  findCurrentBookmarks();
  // createBmarkItems();
}, 0);


  var createBmarkBtn = document.getElementsByClassName('createbookmark__button')[0];
  createBmarkBtn.onclick = function(){
    var btnSpan = this.children[0];
    var btnInput = document.getElementsByClassName("createbookmark__create--input")[0];
    // createBmarkBtn
    if(btnSpan.className == "icon-add"){
      btnSpan.className = "icon-check"
      createBmarkBtn.style.backgroundColor = "#EC407A";
      fadeIn(btnInput);
    } else{
      btnSpan.className = "icon-add"
      createBmarkBtn.style.backgroundColor = "#03A9F4";
      fadeOut(btnInput);
      saveBookmark();
      setTimeout(function() {
        findCurrentBookmarks();
      }, 0);
      btnInput.value = "";
      
    }
  }

  bookmarkToggle.onmouseover = function(){ // Timer icon tooltip on mouseover
    if(document.getElementsByClassName("timerbox")[0].style.display == "block"){
    } else{
      var tooltipWrap = document.createElement("div"); //creates div
      tooltipWrap.className = 'tooltip'; //adds class
      tooltipWrap.appendChild(document.createTextNode("Bookmarks")); //add the text node to the newly created div.
      document.body.appendChild(tooltipWrap);
      tooltipWrap.style.top = "55px";
      tooltipWrap.style.left = "70px";
    }
  }
  bookmarkToggle.onmouseout = function(){ // Timer icon tooltip on mouseout
    if (document.getElementsByClassName("tooltip")[0]){
      document.getElementsByClassName("tooltip")[0].parentNode.removeChild(document.getElementsByClassName("tooltip")[0]);
    }
  }

function saveBookmark(){
  var bookmarkName = document.getElementsByClassName("createbookmark__create--input")[0].value;
  if(bookmarkName != ""){
    if(bookmarkName.substring(0,7) == "http://" ){
      bookmarkName = bookmarkName.substring(7);
    } else if(bookmarkName.substring(0,8) == "https://"){
      bookmarkName = bookmarkName.substring(8);
    }
    chrome.storage.sync.get(["bookmarks"], function(data) {
        var array = data["bookmarks"]?data["bookmarks"]:[];
        array.unshift(bookmarkName);
        var jsonObj = {};
        jsonObj["bookmarks"] = array;
        chrome.storage.sync.set(jsonObj);
    });
    
  }
}
// end of doc