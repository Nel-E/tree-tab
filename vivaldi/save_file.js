function DOM_New(type, parent, parameters, style) {
    let NewElement = document.createElement(type);
    for (param in parameters) {
        NewElement[param] = parameters[param];
    }
    for (param in style) {
        NewElement.style[param] = style[param];
    }
    if (parent) parent.appendChild(NewElement);
    return NewElement;
}

function File_SaveFile(filename, extension, data) {
    let file = new File([JSON.stringify(data)], filename + "." + extension, {type: "text/" + extension + ";charset=utf-8"});
    let savelink = DOM_New("a", document.getElementById("body"), {href:URL.createObjectURL(file), fileSize: file.size, target: "_blank", type: "file", download: (filename + "." + extension)}, {display: "none"});
    savelink.click();
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command == "save_file") {
        File_SaveFile(message.filename, message.extension, message.data);
    }
});
