function onLoad() {

  document.addEventListener('deviceready', function(event) {
    var page = event.target;

    // Firebase configuration object
    var firebaseConfig = {
      apiKey: "AIzaSyCw_xz_Ox65UTCGZl84F3xpIFzXiI4xKV8",
      authDomain: "history-app-422.firebaseapp.com",
      databaseURL: "https://history-app-422.firebaseio.com",
      projectId: "history-app-422",
      storageBucket: "history-app-422.appspot.com",
      messagingSenderId: "1079917112725",
      appId: "1:1079917112725:web:20a121400a1e41d3b81a9c",
      measurementId: "G-R8P7VMTYEC"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Google Access Token.
        // You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log('user info = ', user);
        // window.fn.load("events.html");
      }
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });

    // provides listener for user authenication & checks if a user is logged in or not...
    firebase.auth().onAuthStateChanged((user) => {
      // check if user is logged in or not...
      if (user) {
        if(page == "signin.html"){
          var guestBtn = document.getElementById('guest-button');
          guestBtn.style.display = 'none';
        }
        console.log('user logged in');
      } else {
        console.log('user logged out');
      }
    });

  });

} //end of onLoad()

  window.fn = {};

  window.fn.open = function() {
    var menu = document.getElementById('menu');
    menu.open();
  };

  window.fn.load = (page) => {

    if(page == "events.html"){
      console.log("This is the events page!");

      //set variable for IndexedDB support
      var indexedDBSupport = false;
      if("indexedDB" in window) {
        indexedDBSupport = true;
        console.log("IndexedDB supported...");
      } else {
        console.log("No support...");
      } 

      if(indexedDBSupport) {
        var openRequest = indexedDB.open("history_app", 1);
        var db;
        var date;
        
        openRequest.onupgradeneeded = function(e) {
          console.log("DB upgrade...");
          db = e.target.result;
          if(!db.objectStoreNames.contains("events")) {
              db.createObjectStore("events");
              console.log(`new object store created... ${db.name}`);
            }
        } //end of upgradeneeded fn
        
        openRequest.onsuccess = function(e) {
          console.log("DB success. Loading events..");
          db = e.target.result;

            var dbTransaction = db.transaction("events", "readwrite");
            events_arr = [
              {
              title: "Killer fogs begin in London, England; the term 'Smog' is coined",
              date: "12-04",
              full_date: "December 4, 1952",
              details: "For five days in December 1952, the Great Smog of London smothered the city, wreaking havoc and killing thousands.",
              picture: "../img/londonfog.jpg"
              },
              {
              title: "Aircraft squadron lost in the Bermuda Triangle",
              date: "12-05",
              full_date: "December 5, 1945",
              details: "At 2:10 p.m., five U.S. Navy Avenger torpedo-bombers comprising Flight 19 take off from the Ft. Lauderdale Naval Air Station on a routine three-hour training mission. They never returned.",
              picture: "../img/flight19.jpg"
              },
              {
              title: "Starbucks opens its largest cafe in the world in Shanghai",
              date: "12-06",
              full_date: "December 6, 2017",
              details: "Called the Starbucks Roastery Shanghai, Starbucks' second Roastery measures an astounding 30,000 sq ft - that is almost half of a football field.",
              picture: "../img/starbucks_shanghai.jpg"
              }
            ];
            var dataStore = dbTransaction.objectStore("events");
            events_arr.forEach(event => {
              var addRequest = dataStore.add(event, event.date);
              // success handler
              addRequest.onsuccess = function(e) { 
                console.log("data stored...");
              }
              // error handler
              addRequest.onerror = function(e) { 
                console.log(e.target.error.name);
              }
            });

            date = "12-05";
            //for current month & date, use new Date() and methods: getMonth() & getDate()
            //documentation: w3schools.com/js/js_date_methods.asp
            db = e.target.result;
            var dbTransaction = db.transaction(["events"],"readwrite");
            var dataStore = dbTransaction.objectStore("events");
            var request = dataStore.get(date);

            request.onsuccess = event => {
              console.log(request.result);
              //event title
              var title = document.getElementById('title');
              title.innerHTML = request.result.title;

              //event picture
              var pic = document.getElementById('event-picture');
              pic.src = request.result.picture;
              console.log(pic.src);

              //event details
              var eventDetails = document.getElementById('event-details');
              eventDetails.innerHTML = request.result.details;
              
              checkIfFavorited(date);
              console.log("Request posted!");
            }
            request.onerror = event => {console.log("error with request");}
        }

        openRequest.onerror = e => {
            console.log("DB error...");
            console.dir(e);
        }
      }
    } else if (page == "favorite.html") {
      console.log("This is the favorites page!");
      //set variable for IndexedDB support
      var indexedDBSupport = false;
      if("indexedDB" in window) {
        indexedDBSupport = true;
        console.log("IndexedDB supported...");
      } else {
        console.log("No support...");
      } 
      if(indexedDBSupport) {
        var favDB = indexedDB.open(["user_favorites"], 1);
        var db;

        favDB.onsuccess = function(e) {
          console.log("Favorites DB success.");
          db = e.target.result;
          var dbTransaction = db.transaction(["favorite_events"], "readonly");
          var dataStore = dbTransaction.objectStore("favorite_events");
          var request = dataStore.openCursor();
          
          request.onsuccess = e => {
            var cursor = e.target.result;
            if(cursor){
              console.log("Displaying favorites.");
              
              //create elements
              var eventData = document.getElementById("favorite-events-data");
              var title = document.createElement("h3");
              title.innerHTML = cursor.value.title;
              eventData.appendChild(title);

              var pic = document.createElement("img");
              pic.src = cursor.value.picture;
              pic.setAttribute("class", "picture-center");
              eventData.appendChild(pic);

              var event_data = document.createElement("p");
              event_data.setAttribute("class", "event-detail");
              event_data.innerHTML = cursor.value.details;
              eventData.appendChild(event_data);

              var btnToUnfavorite = ons._util.createElement("<ons-button modifier='outline' class='unfavorite-btn' style='color: #E32227; border-color: #E32227'><i class='fas fa-heart-broken'></i> Unfavorite</ons-button>");
              btnToUnfavorite.addEventListener("click", removeFavorite2);
              eventData.appendChild(btnToUnfavorite);

              //continue to the next object in the object store
              cursor.continue();
            } else{
              console.log("No favorites!")
            }

          request.onerror = event => {console.log("error with request");}
          }

        favDB.onerror = e => {
            console.log("DB error...");
            console.dir(e);
        }
      }
    }
  }

    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
      .then(menu.close.bind(menu));
  };


  //have a favorite button that disappears once favorite is clicked &..
  //show unfavorite button and when clicked removes favorite from data store
  window.fn.addToFavorites = () => {
    var indexedDBSupport = false;
    if("indexedDB" in window) {
      indexedDBSupport = true;
      console.log("IndexedDB supported...");
    } else {
      console.log("No support...");
    } 

    if(indexedDBSupport) {
      var openDB = indexedDB.open("user_favorites", 1);
      var db;
      
      openDB.onupgradeneeded = function(e) {
        console.log("DB upgrade...");
        db = e.target.result;
        if(!db.objectStoreNames.contains("favorite_events")) {
            db.createObjectStore("favorite_events");
            console.log(`new object store created... ${db.name}`);
          }
      } //end of upgradeneeded fn
      
      openDB.onsuccess = function(e) {
        alert("Added to favorites!");
        console.log("DB success. Adding to favorited events..");
        db = e.target.result;

        var dbTransaction = db.transaction("favorite_events", "readwrite");
        var favStore = dbTransaction.objectStore("favorite_events");
        var item = {
          title: document.getElementById("title").innerText,
          details: document.getElementById("event-details").innerText,
          picture: document.getElementById("event-picture").src,
          date: "12-05"
        };
        var addRequest = favStore.add(item, item.date);
          // success handler
        addRequest.onsuccess = function(e) { 
          console.log("favorite stored...");
        }
        // error handler
        addRequest.onerror = function(e) { 
          console.log(e.target.error.name);
        }

        var fav_btn = document.getElementById('favorite-btn');
        fav_btn.style.display = "none";
        document.getElementById("unfavorite-btn").style.display = "inline";
      }
    }
  }

  window.fn.removeFavorite = () => {
    var indexedDBSupport = false;
    if("indexedDB" in window) {
      indexedDBSupport = true;
      console.log("IndexedDB supported...");
    } else {
      console.log("No support...");
    } 

    if(indexedDBSupport) {
      var openDB = indexedDB.open("user_favorites", 1);
      var db;
      
      openDB.onupgradeneeded = function(e) {
        console.log("DB upgrade...");
        db = e.target.result;
        if(!db.objectStoreNames.contains("favorite_events")) {
            db.createObjectStore("favorite_events");
            console.log(`new object store created... ${db.name}`);
          }
      }
      
      openDB.onsuccess = function(e) {
        alert("Removed from favorites!");
        console.log("DB success. Removing favorited event..");
        db = e.target.result;

        var dbTransaction = db.transaction("favorite_events", "readwrite");
        var favStore = dbTransaction.objectStore("favorite_events");
        var item = {
          title: document.getElementById("title").innerText,
          eventDetails: document.getElementById("event-details").innerText,
          date: "12-05"
        };
        var removeRequest = favStore.delete(item.date);
          // success handler
        removeRequest.onsuccess = function(e) { 
          console.log("favorite removed...");
        }
        // error handler
        removeRequest.onerror = function(e) { 
          console.log(e.target.error.name);
        }

        var unfav_btn = document.getElementById('unfavorite-btn');
        unfav_btn.style.display = "none";
        document.getElementById("favorite-btn").style.display = "inline";
      }
    }
  }

   // start logout call to return sign-out...
  window.fn.startLogout = () => {
    return firebase.auth().signOut();
  };

  window.fn.onSubmit = () => {
    alert("You pressed the Submit button!");
    // AUTH - define provider
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // Start a sign in process for an unauthenticated user
    googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    firebase.auth().signInWithRedirect(googleProvider).then(function() {
      return firebase.auth().getRedirectResult();
    }).then(function(result) {
      // This gives you a Google Access Token.
      // You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log("Sign in successful. Loading events...");
      window.fn.load("events.html");
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
}

var checkIfFavorited = (date) => {
  var openDB = indexedDB.open("user_favorites", 1);
  var db;

  openDB.onupgradeneeded = function(e) {
    db = e.target.result;
    console.log("Favorites DB upgrade...");
    if(!db.objectStoreNames.contains("favorite_events")) {
      db.createObjectStore("favorite_events");
      console.log(`new object store created... ${db.name}`);
    }
  } //end of upgradeneeded fn

  openDB.onsuccess = e => {
    db = e.target.result;
    console.log(date);
    console.log("Favorites object store opened..");
    console.log("Checking if event is favorited...");

    var dbTransaction = db.transaction("favorite_events", "readonly");
    var favStore = dbTransaction.objectStore("favorite_events");
    var favRequest = favStore.openCursor();
  
    favRequest.onsuccess = e => {
      //using openCursor() from: https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/openCursor
      var cursor = e.target.result;
      console.log(`Cursor date: ${cursor.value.date}. Date: ${date}.`);

      //area that needs work
      if(cursor.value.date === date){
        console.log("Event is already a favorite.");
        // var fav_btn = document.getElementById('favorite-btn');
        // fav_btn.style.display = "none";
        document.getElementById("favorite-btn").style.display = "none";
        document.getElementById("unfavorite-btn").style.display = "inline";
      } else{
        console.log("No favorites!")
      }
      //end of area that needs work
    }

    favRequest.onerror = e => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);

      var unfav_btn = document.getElementById("unfavorite-btn");
      unfav_btn.style.display = "none";
      document.getElementById("favorite-btn").style.display = "inline";
    }
  }
}

var removeFavorite2 = () => {
  var indexedDBSupport = false;
  if("indexedDB" in window) {
    indexedDBSupport = true;
    console.log("IndexedDB supported...");
  } else {
    console.log("No support...");
  } 

  if(indexedDBSupport) {
    var openDB = indexedDB.open("user_favorites", 1);
    var db;
    var date = "12-05";
    
    // openDB.onupgradeneeded = function(e) {
    //   console.log("DB upgrade...");
    //   db = e.target.result;
    //   if(!db.objectStoreNames.contains("favorite_events")) {
    //       db.createObjectStore("favorite_events");
    //       console.log(`new object store created... ${db.name}`);
    //     }
    // }
    
    openDB.onsuccess = function(e) {
      alert("Removed from favorites!");
      console.log("DB success. Removing favorited event..");
      db = e.target.result;

      var dbTransaction = db.transaction("favorite_events", "readwrite");
      var favStore = dbTransaction.objectStore("favorite_events");
      var removeRequest = favStore.delete(date);
        // success handler
      removeRequest.onsuccess = function(e) { 
        console.log("favorite removed...");
        fn.load('favorite.html');
      }
      // error handler
      removeRequest.onerror = function(e) { 
        console.log(e.target.error.name);
      }
    }
  }
}

onLoad();







// document.addEventListener('init', function(event) {

//   var page = event.target;

// });

// window.fn = {};

// window.fn.open = function() {
//   var menu = document.getElementById('menu');
//   menu.open();
// };

// window.fn.load = function(page) {

//   if(page == "events.html"){
//     console.log("This is the events page!");

//     //set variable for IndexedDB support
//     var indexedDBSupport = false; //check IndexedDB support 
//     if("indexedDB" in window) {
//       indexedDBSupport = true;
//       console.log("IndexedDB supported...");
//     } else {
//     console.log("No support...");
//     } 

//     if(indexedDBSupport) {
//       var openDB = indexedDB.open("history_app", 1);
//       openDB.onupgradeneeded = function(e) {
//           console.log("DB upgrade...");
//           //local var for db upgrade
//           var upgradeDB = e.target.result;
//           if (!upgradeDB.objectStoreNames.contains("events")) {
//               upgradeDB.createObjectStore("events");
//               console.log("new object store created...");
//           }
//       }
      
//       openDB.onsuccess = function(e) {
//           console.log("DB success...");

//           events_arr = [
//             {
//             title: "Test Title 1/3",
//             date: "05-01",
//             details: "This is test event #1 of 3"
//             },
//             {
//             title: "Test Title 2/3",
//             date: "05-02",
//             details: "This is test event #2 of 3"
//             },
//             {
//             title: "Test Title 3/3",
//             date: "05-03",
//             details: "This is test event #3 of 3"
//             }
//           ]

//           db = e.target.result;
//           var dbTransaction = db.transaction(["events"],"readwrite");
//           var dataStore = dbTransaction.objectStore("events");
//           var addRequest;

//           events_arr.forEach(event => {
//             addRequest = dataStore.add(event,event.date);
//           })

//           // success handler
//           addRequest.onsuccess = function(e) { 
//             console.log("data stored...");
//           }
//           // error handler
//           addRequest.onerror = function(e) { 
//             console.log(e.target.error.name); // handle error...
//           }
//       }
      
//       openDB.onerror = function(e) {
//           console.log("DB error...");
//           console.dir(e);
//       }
//     }


//   }

//   var content = document.getElementById('content');
//   var menu = document.getElementById('menu');
//   content.load(page)
//     .then(menu.close.bind(menu));
// };

// window.fn.myAlert = function(){
//   var fav_btn = document.getElementById('favorite-btn');
//   alert("Added to favorites!");
//   fav_btn.innerHTML = "<i class='fas fa-heart-broken'></i> Unfavorite";
// }

