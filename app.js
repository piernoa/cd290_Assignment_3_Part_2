// click function for search button
var getData = function () {
  console.log('getData');

  // number of pages requested
  var numPages = document.getElementById('numPages').value;

  if (numPages >= 6 || numPages <=0 || numPages === "") {
    alert('Please enter a number between 1 and five.');
    return;
  }

  //checkboxes
  var jayson = document.getElementById('JSON');
  var Python = document.getElementById('Python');
  var jvScript = document.getElementById('jvScript');
  var SQL = document.getElementById('SQL');


  //function for saving list item to favorites
  var saveToFavorites = function (link, description, language) {
    // get old favorite
    var favs = JSON.parse(localStorage.getItem('favorites'));

    // push new item to oldFavs array
    favs.favs.push({link: link, description:description, language:language});

    //save to local storage
    localStorage.setItem('favorites', JSON.stringify(favs));

    loadFavorites("save");
  };

  // put all that git hub goodness in DOM
  var goshDOMit = function (data) {

    var testData = JSON.parse(data);
    var resultsDiv = document.getElementsByClassName("results")[0];
    var ul = document.getElementById('resultsUl');
    var listNode; // li element
    var linkNode; // a element
    var pNode; // p to hold 'add to favorites'
    var filtered = []; // to hold array of data after we check for items in local storage

    //check if we need to remove old search
    if (ul.childNodes.length > 5) {
      console.log('remove old search');
      while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
      }
    }

    /*remove any items in favorites from search results
    * match by 'description' because some items have the same description and it
    * looks like this filter isn't working. This is done for ease of grading in
    * the assigment. the match could easily be changed to match on url but visually
    * is more subtle that it is working. Particularly since there are so many
    * 'Bootstrap Customizer Configs' */
    var removedFavorites = [];

    //check if we have any favorites
    var localData = JSON.parse(localStorage.getItem('favorites'));

    if (localData !== null && localData.favs !== null && localData.favs.length > 0) {
      for (var i=0; i<testData.length; i++) {
        var match = 0;
        for (var j=0; j<localData.favs.length;j++) {
          if (testData[i].description == localData.favs[j].description) {
            match = 1;
          }
        }
        if (match == 0) {
          removedFavorites.push(testData[i]);
        }
      }
    } else {
      removedFavorites = testData;
    }

    // check if we need to filter results after already filtering for items in favorites
    if (jayson.checked || Python.checked || jvScript.checked || SQL.checked) {
      for (var i=0; i<removedFavorites.length;i++) {
        var language;
        var language_obj = removedFavorites[i].files;

        //takes care of empty file objects
        if (JSON.stringify(language_obj) == "{}" || language_obj === null || language_obj === undefined) {
          language = "?";
        } else {
          // using object map to get to the language property of the files when we don't know
          // exactly what they named their file.
          var languageArr = Object.keys(language_obj).map(function(files) { return language_obj[files] });

          if (languageArr[0].language === null || languageArr[0].language  === undefined) {
            language = "?";
          } else {
            language = languageArr[0].language;
          }

        }

        // these are the checkbox filters
        if (jayson.checked && language == 'JSON') {
          filtered.push(removedFavorites[i]);
        }
        if (Python.checked && language == 'Python') {
          filtered.push(removedFavorites[i]);
        }
        if (jvScript.checked && language == 'JavaScript') {
          filtered.push(removedFavorites[i]);
        }
        if (SQL.checked && language == 'SQL') {
          filtered.push(removedFavorites[i]);
        }
      }
    } else {
      filtered = removedFavorites;
    }

    // @ testData.description
    for (var i=0; i<filtered.length; i++) {
      listNode = document.createElement('li');
      linkNode = document.createElement('a');
      linkNode.href = filtered[i].html_url;
      linkNode.innerHTML = "Description: " + filtered[i].description;
      commentNode = document.createElement('p');
      commentNode.innerHTML = "Comments:&nbsp;&nbsp;&nbsp; " + filtered[i].comments;
      pNode = document.createElement('button');
      pNode.innerHTML = "Save To Favorites";

      // creating a closure for the onclick event to bind description, language, and html_url
      pNode.onclick = (function () {
        var link = filtered[i].html_url;
        var description;
        if (filtered[i].description == "" || filtered[i].description == " " ||
        filtered[i].description == null || filtered[i].description == undefined ) {
          description = "?";
        } else {
          description = filtered[i].description;
        }

        var language_obj = filtered[i].files;

        //takes care of empty file objects
        if (JSON.stringify(language_obj) == "{}" || language_obj === null || language_obj === undefined) {
          language = "?";
        } else {
          var languageArr = Object.keys(language_obj).map(function(files) { return language_obj[files] });
          var language;
          if (languageArr[0].language === null || languageArr[0].language  === undefined) {
            language = "?";
          } else {
            language = languageArr[0].language;
          }

        }

        return function () {
          saveToFavorites(link, description, language);
        };
      })();

      ul.appendChild(listNode).appendChild(linkNode);
      listNode.appendChild(commentNode);
      listNode.appendChild(pNode);
    }
    resultsDiv.appendChild(ul);
  };

  // Define Response Object
  var gitHubResults = function () {
    console.log('Results');
    if (req.readyState == 4) {
      if (req.status == 200) {
        // handle the data
        goshDOMit(req.responseText);
      } else {
        alert('There was something funky with the request. Try again.');
        return;
      }
    }
  };

  //AJAX Request
  var url = "https://api.github.com/gists?page=1&per_page="+ 30*Number(numPages);
  var req;

  // based on MDN Docs @ https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
  if (window.XMLHttpRequest) { // Mozilla, Safari, ...
    req = new XMLHttpRequest();
  } else if (window.ActiveXObject) { // IE
    try {
      httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch (e) {
      try {
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
      }
      catch (e) {
        alert('There was an error! All we know is:' + e);
      }
    }
  } else {
    alert('Bummer! Cannot create an XMLHTTP instance.');
    return;
  }

  //when the 'promise' returns, handle it with gitHubResults function.
  req.onreadystatechange = gitHubResults;
  req.open('GET', url);
  req.send();

};

// remove favorites from local storage and update dom
var removeFromFavorites = function(link, description, lang) {
  // set new data
  var localData = JSON.parse(localStorage.getItem('favorites'));

  for (var i=0; i<localData.favs.length; i++) {
    if (localData.favs[i].link == link) {
      localData.favs.splice(i,1);
    }
  }
  localStorage.setItem("favorites", JSON.stringify(localData));

  // remove all nodes from favorites
  // call loadFavorites from "save"
  // this means we already know there are things in local storage and don't have to check again.
  loadFavorites("save");
};

// Load Favorites from Local Storage
var loadFavorites = function (where) {
  // get the local storage data object:
  var localData = JSON.parse(localStorage.getItem('favorites'));
  var favDiv = document.getElementsByClassName('favorites')[0];
  var ul = document.createElement('ul');
  ul.id = "favsUl";
  var listNode; // li element
  var linkNode; // a element

  if (localData !== null) {
    // array is @ localData.favs
    for (var i=0; i<localData.favs.length; i++) {
      listNode = document.createElement('li');
      pNode = document.createElement('p');
      linkNode = document.createElement('a');
      linkNode.href = localData.favs[i].link;
      linkNode.innerHTML = localData.favs[i].description;
      pNode.innerHTML = "Language: " + localData.favs[i].language;

      //create delete button
      deleteButton = document.createElement('button');
      deleteButton.innerHTML = "Delete";

      //delete button closure
      deleteButton.onclick = (function () {
        var link = localData.favs[i].link;
        var description = localData.favs[i].description;
        var lang = localData.favs[i].lang;

        return function () {
          removeFromFavorites(link, description, lang);
        };
      })();

      ul.appendChild(listNode).appendChild(linkNode);
      listNode.appendChild(pNode);
      listNode.appendChild(deleteButton);
    }
    favDiv.appendChild(ul);
  }
  // flag if function called from onload event or from clicking save.
  if (where == "save") {
    // This is an update, we need to delete nodes currently in the DOM
    var favsUl = document.getElementById('favsUl');
    favDiv.removeChild(favsUl);
  }

};

// when the window is ready, lets fire up those favorites!
window.onload = function () {
  // local storage check
  if (localStorage.getItem('favorites')) {
    // we've already checked this on a previous visit, localStorage is good to go.
    //create favorites list
  } else {
    localStorage.setItem('favorites', 'andrew');
    var check = localStorage.getItem('favorites');
    if (check != 'andrew') {
      // localstorage looks isn't working properly
      alert('Local Storage Error');
      return;
    }
    var favorites = {'favs': []};
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  // load favorites if there are any
  loadFavorites("onLoad");
};
