function GetFileBuffer (file)
{
	return new Promise ((resolve, reject) => {
		let reader = new FileReader ();
		reader.onloadend = function (event) {
			if (event.target.readyState === FileReader.DONE) {
				resolve (event.target.result);
			}
		};
		reader.onerror = function () {
			reject ();
		};
		reader.readAsArrayBuffer (file);
	});		
}

function LoadModel (ajs, files, onLoad)
{
	let downloadFiles = [];
	for (let i = 0; i < files.length; i++) {
		downloadFiles.push (GetFileBuffer (files[i]));
	}
	Promise.all (downloadFiles).then ((arrayBuffers) => {
		let fileList = new ajs.FileList ();
		for (let i = 0; i < arrayBuffers.length; i++) {
			fileList.AddFile (files[i].name, new Uint8Array (arrayBuffers[i]));
		}
		let result = ajs.ImportModel (fileList);
		onLoad (result);
	});
}

window.onload = function () {
	let dragDropDiv = document.getElementById ('dragdrop');
	let resultDiv = document.getElementById ('result');
	resultDiv.style.display = 'none';
	let texts = {
		loadingAssimpJS : 'LOADING ASSIMPJS...',
		loadingModel : 'LOADING MODEL...',
		dragDrop : 'DRAG & DROP YOUR FILES'
	};
	dragDropDiv.innerHTML = texts.loadingAssimpJS;
	assimpjs ().then (function (ajs) {
		dragDropDiv.innerHTML = texts.dragDrop;
		window.addEventListener ('dragstart', (ev) => {
			ev.preventDefault ();
		}, false);
		window.addEventListener ('dragover', (ev) => {
			ev.stopPropagation ();
			ev.preventDefault ();
			ev.dataTransfer.dropEffect = 'copy';
		}, false);
		window.addEventListener ('drop', (ev) => {
			ev.stopPropagation ();
			ev.preventDefault ();
			if (ev.dataTransfer.files.length > 0) {
				dragDropDiv.innerHTML = texts.loadingModel;
				resultDiv.style.display = 'none';
				resultDiv.innerHTML = '';
				LoadModel (ajs, ev.dataTransfer.files, (result) => {
					dragDropDiv.innerHTML = texts.dragDrop;
					let resultJson = JSON.parse (result);
					let formatter = new JSONFormatter (resultJson, 1, {
						'theme' : 'dark'
					});
					resultDiv.style.display = 'block';
					resultDiv.appendChild (formatter.render ());
				});
			}
		}, false);
	});
};