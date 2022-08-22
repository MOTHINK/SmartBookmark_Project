const linksList = document.getElementById('linksList');
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.indexedDB) {
        console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    } else {
        console.log("Your browser support a stable version of IndexedDB.");
    }
    
    getData();
    let a = "https://www.google.com/search?q=traductor&sxsrf=ALeKk0291MZahoEoOOB8r3cdwLFtggIYaw%3A1625856922746&ei=mpvoYK-OLYLYaJTyvPgB&oq=trad&gs_lcp=Cgdnd3Mtd2l6EAMYADIECCMQJzIECCMQJzIKCAAQsQMQgwEQQzIECAAQQzIFCAAQsQMyBQgAELEDMgUIABCxAzIFCAAQsQMyBQgAELEDMgUIABCxAzoHCAAQRxCwAzoICAAQsQMQgwE6BggjECcQEzoCCABKBAhBGABQ7EdYgUxg0FNoA3ACeACAAVWIAf8CkgEBNZgBAKABAaoBB2d3cy13aXrIAQdjAAQE&sclient=gws-wiz";
    let b = "https://www.google.com/search?q=traductor&sxsrf=ALeKk0291MZahoEoOOB8r3cdwLFtggIYaw%3A1625856922746&ei=mpvoYK-OLYLYaJTyvPgB&oq=trad&gs_lcp=Cgdnd3Mtd2l6EAMYADIECCMQJzIECCMQJzIKCAAQsQMQgwEQQzIECAAQQzIFCAAQsQMyBQgAELEDMgUIABCxAzIFCAAQsQMyBQgAELEDMgUIABCxAzoHCAAQRxCwAzoICAAQsQMQgwE6BggjECcQEzoCCABKBAhBGABQ7EdYgUxg0FNoA3ACeACAAVWIAf8CkgEBNZgBAKABAaoBB2d3cy13aXrIAQjAAQE&sclient=gws-wiz";
    if(a == b) {
        console.log("true");
    }    
});


document.getElementById("save-button").addEventListener('click', function(){
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function(tabs){
      const url = tabs[0].url;
      const title = tabs[0].title;
      const faviconUrl = url.split('/');
      const favicon = "https://www.google.com/s2/favicons?domain=" + faviconUrl[2];
      const object = {
          "id": "",
          "url": url+"",
          "title": title+"",
          "favicon": favicon+"",
          "views": 0
      }
      addData(object);
      document.location.reload();
    }
    );
});

document.getElementById("delete-button").addEventListener('click', function(){
    deleteData();
    document.location.reload();
});



const addData = (object) => {
    let db;
    const request = indexedDB.open("bookmarks",1);
    request.onsuccess = (event) => {
        db = request.result;
        const transaction = db.transaction(["bm-store"], "readwrite");
        const objectStore = transaction.objectStore("bm-store");
        let req = objectStore.add(object);
        req.onsuccess = (event) => {
            console.log("success");
            // db.close();
        }
        req.onerror = (event) => {
            console.log("Error while adding data: " + event.target.errorCode);
        }
        transaction.oncomplete = () => {
            db.close();
        }
    }
    request.onerror = (event) => {
        console.log("Error while adding data: " + event.target.errorCode);
    }
}

const getData = () => {
    let objects = [];
    let div = "";
    let db;
    const request = indexedDB.open("bookmarks",1);
    request.onsuccess = (event) => {
        db = request.result;
        const transaction = db.transaction(["bm-store"],"readonly");
        const objectStore = transaction.objectStore("bm-store");
        const req = objectStore.getAll();
        req.onsuccess = (event) => {
            for(let i = 0;i < req.result.length;i++){
                // console.log(req.result[i].name);
                objects.push(req.result[i]);
                div+= `<div id="row">
                            <div id="remove">
                                <input name="_checkbox" type="checkbox" value="${req.result[i].url}" />
                            </div>
                            <div id="icon"><img src="${req.result[i].favicon}"/></div>
                            <div id="url"><a href="${req.result[i].url}" target="_blank" title="${req.result[i].title}">${req.result[i].title}</a></div>
                       </div>`;
            }
            linksList.innerHTML = div;
            // db.close();
        }
        req.onerror = (event) => {
            console.log("Error while getting data: " + event.target.errorCode);
        }
        transaction.oncomplete = () => {
            db.close();
        }
    }
    request.onupgradeneeded = (event) => {
        db = request.result;
        console.log("DB created");
        const objectStore = db.createObjectStore("bm-store", {
            keyPath: "url"
        });
        objectStore.createIndex("url", "url", { unique: true });
    }
    request.onerror = (event) => {
        console.log("Error while getting data: " + event.target.errorCode);
    }
    return objects;
}


const deleteData = () => {
    let values = [];
    let db;
    const request = indexedDB.open("bookmarks",1);
    request.onsuccess = (event) => {
        db = request.result;
        const transaction = db.transaction(["bm-store"], "readwrite");
        const objectStore = transaction.objectStore("bm-store");
        
        var values = document.querySelectorAll('input[type=checkbox]:checked');
        for(let i = 0;i < values.length;i++) {
            let req = objectStore.delete(values[i].value);
            req.onsuccess = (event) => {
                console.log("The site: " + values[i].value + " was successfuly deleted");
            }
            req.onerror = (event) => {
                console.log("Error while deleting the site: " + values[i].value);
            }
        }
        transaction.oncomplete = () => {
            db.close();
        }
    }
    request.onerror = (event) => {
        console.log("Error while adding data: " + event.target.errorCode);
    }
}


