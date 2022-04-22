// Copyright (c) 2022. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function objectsToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr)
  return array.map(row => {
      return Object.values(row).map(value => {
          return typeof value === 'string' ? JSON.stringify(value) : value
      }).toString()
  }).join('\n')
}

async function downloadErrors(info, tab) {
  FILE_SUBMISSION_URL_PREFIX = "https://www.calpads.org/FileSubmission/Detail/";
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  if (!info.pageUrl.startsWith(FILE_SUBMISSION_URL_PREFIX)) {
    alert("Must be on Calpads file submission page");
    return;
  }
  file_id = info.pageUrl.substr(FILE_SUBMISSION_URL_PREFIX.length);
  console.log("tab: " + JSON.stringify(tab));
  console.log(file_id);
  const response = await fetch(
    "https://www.calpads.org/FileSubmission/Detail/" + file_id + "/Errors?format=json&skip=0&take=5000&ErrorCode=",
    {
      method: "GET",
      headers: { "x-requested-with": "XMLHttpRequest" },
    }
  );
  console.log(response);
  if (!response.ok) {
    throw new Error("Error retrieving JSON");
  }
  console.log("Success");
  var resp = await response.json();
  console.log(resp);
  for (const r of resp.Data) {
    for (const k in r.Record) {
      r['r_' + k] = r.Record[k]
    }
    delete r.Record;
  }
  console.log(resp['Data']);
  csv_file = objectsToCSV(resp.Data)
  chrome.downloads.download({
    url: 'data:text/csv; base64,' + btoa(csv_file),
    filename: 'errors.csv'
  })
}

console.log("Creating context menu");
var id = chrome.contextMenus.create({
  "id": "calpads_download",
  "title": "Calpads Download Errors CSV",
  "documentUrlPatterns": ["https://www.calpads.org/FileSubmission/Detail/*"],
  "contexts":["page"]
});
chrome.contextMenus.onClicked.addListener(downloadErrors);
