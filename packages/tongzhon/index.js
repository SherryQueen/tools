function download() {
  const link = document.querySelector('audio').src;
  const audioName = document.querySelector('#main-row > div strong').innerText ?? '';
  const audioAuthor = (document.querySelector('#main-row > div').innerText ?? '').replace('\n', '');

  const name = audioAuthor.replace(audioName, audioName + '-');

  console.info(`wget ${link} -O "${name}.mp3"`);

  fetch(link).then((res) => {
    res.blob().then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `${name}.mp3`;
      a.href = url;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  });
}

download();
