chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.command == "show_save_file_dialog") {
		let file = new File([JSON.stringify(message.data)], message.filename, {type: "text/csv;charset=utf-8"} );
		let body = document.getElementById("body");
		let savelink = document.createElement("a");
		savelink.target = "_blank";
		savelink.style.display = "none";
		savelink.type = "file";
		savelink.download = message.filename;
		savelink.href = URL.createObjectURL(file);
		body.appendChild(savelink);		
		savelink.click();
		setTimeout(function() {
			chrome.tabs.update(message.currentTabId, { active: true });
			chrome.tabs.remove(message.selfTabId, null);
		}, 50);
	}
});
