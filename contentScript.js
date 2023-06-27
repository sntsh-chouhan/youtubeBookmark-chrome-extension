(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    const getTime = (time) => {
        const date = new Date(0);
        date.setSeconds(time);
        const slicedTime = date.toISOString().slice(11, 19);
        return slicedTime;
    };

    

    const fetchBookmark = ()=>{
        return new Promise((resolve) =>{
            chrome.storage.sync.get([currentVideo], (obj)=>{
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]):[]); 
            });
        });
    };

    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        // console.log(bookmarkBtnExists);
        currentVideoBookmarks = await fetchBookmark();

        
    
        if (!bookmarkBtnExists) {
          const bookmarkBtn = document.createElement("img");
    
          bookmarkBtn.src = chrome.runtime.getURL("images/bookmark.png");
          bookmarkBtn.className = "ytp-button " + "bookmark-btn";
          bookmarkBtn.title = "Click to bookmark current timestamp";
    
          youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
          youtubePlayer = document.getElementsByClassName('video-stream')[0];
    
          youtubeLeftControls.appendChild(bookmarkBtn);
          bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
      };

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };

        console.log(newBookmark);

        currentVideoBookmarks = await fetchBookmark();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }


    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }else if(type==="PLAY"){
            youtubePlayer.currentTime=value;
        }else if(type==="DELETE"){
            currentVideoBookmarks = currentVideoBookmarks.filter((b)=>b.time != value);
            chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoBookmarks)});

            response(currentVideoBookmarks);
        }
    });
    newVideoLoaded();
})();


