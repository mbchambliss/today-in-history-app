document.addEventListener('init', function(event) {

  var page = event.target;

});

window.fn = {};

window.fn.open = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

window.fn.load = function(page) {

  if(page == "events.html"){
    console.log("This is the events page!");

    //set variable for IndexedDB support
    var indexedDBSupport = false; //check IndexedDB support 
    if("indexedDB" in window) {
      indexedDBSupport = true;
      console.log("IndexedDB supported...");
    } else {
    console.log("No support...");
    } 

    if(indexedDBSupport) {
      var openDB = indexedDB.open("history_app", 1);
      openDB.onupgradeneeded = function(e) {
          console.log("DB upgrade...");
          //local var for db upgrade
          var upgradeDB = e.target.result;
          if (!upgradeDB.objectStoreNames.contains("events")) {
              upgradeDB.createObjectStore("events");
              console.log("new object store created...");
          }
      }
      
      openDB.onsuccess = function(e) {
          console.log("DB success...");

          events_arr = [
            {
            title: "Test Title 1/3",
            date: "05-01",
            details: "This is test event #1 of 3"
            },
            {
            title: "Test Title 2/3",
            date: "05-02",
            details: "This is test event #2 of 3"
            },
            {
            title: "Test Title 3/3",
            date: "05-03",
            details: "This is test event #3 of 3"
            }
          ]

          db = e.target.result;
          var dbTransaction = db.transaction(["events"],"readwrite");
          var dataStore = dbTransaction.objectStore("events");
          var addRequest;

          events_arr.forEach(event => {
            addRequest = dataStore.add(event,event.date);
          })

          // success handler
          addRequest.onsuccess = function(e) { 
            console.log("data stored...");
          }
          // error handler
          addRequest.onerror = function(e) { 
            console.log(e.target.error.name); // handle error...
          }
      }
      
      openDB.onerror = function(e) {
          console.log("DB error...");
          console.dir(e);
      }
    }


  }




  var content = document.getElementById('content');
  var menu = document.getElementById('menu');
  content.load(page)
    .then(menu.close.bind(menu));
};

window.fn.myAlert = function(){
  var fav_btn = document.getElementById('favorite-btn');
  alert("Added to favorites!");
  fav_btn.innerHTML = "<i class='fas fa-heart-broken'></i> Unfavorite";
}

