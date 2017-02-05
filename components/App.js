import React, { Component } from 'react';
import update from 'react-addons-update';
import axios from 'axios';
import Visualizer from './Visualizer';
import Controller from './Controller';
import Header from './Header';
import NowPlaying from './NowPlaying';
import Lyrics from './Lyrics';
import Playlist from './Playlist';
//get audio file info
import jsmediatags from 'jsmediatags';
//get main/sub color from dataImage
import ColorThief from 'color-thief-standalone';
// toast 
import { Toast } from './Toast';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Set up the visualisation elements
      visualizeSet: {
        circle: 2 * Math.PI,
        radius: 200,
        objWidth: 4,
        objCount: 150,
        data: []
      },
      audioData: {
        src: '',
        album: '',
        title: '',
        artist: '',
        cover: ''
      },
      colors: {
        main: 'black',
        sub: 'white'
      },
      showLyrics: false,
      findLyrics: false,
      lyrics: [],
      showPlaylist: false,
      playlist: [],
      scroll: 0.5,
    }
    this.handlePlay = this.handlePlay.bind(this);
    this.fileChange = this.fileChange.bind(this);
    this.visualizing = this.visualizing.bind(this);
    this.handleLyricsBtn = this.handleLyricsBtn.bind(this);
    this.findLyrics = this.findLyrics.bind(this);
    this.colorReversal = this.colorReversal.bind(this);
    this.useMic = this.useMic.bind(this);
    this.openFindLyrics = this.openFindLyrics.bind(this);
    this.lyricsMounted = this.lyricsMounted.bind(this);
    this.wheelEvent = this.wheelEvent.bind(this);
    this.changeState_colors = this.changeState_colors.bind(this);
    this.changeState_audioData = this.changeState_audioData.bind(this);
    this.showPlaylist = this.showPlaylist.bind(this);
    this.changeMusic = this.changeMusic.bind(this);

    // initialState
    this.initialState = this.state;

    // Init Settings
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.7;
    this.analyser.fftSize = 2048;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    // Init Settings - microphone
    this.acMic = new AudioContext();
    this.anMic = this.acMic.createAnalyser();
    this.anMic.smoothingTimeConstant = 0.7;
    this.anMic.fftSize = 2048;
    this.frequencyData = new Uint8Array(this.anMic.frequencyBinCount);
  }
  visualizing() {
    let frequencyData = this.frequencyData,
      analyser = this.analyser;

    requestAnimationFrame(this.visualizing);

    analyser.getByteFrequencyData(frequencyData);

    // visualiz object height changed
    this.setState({
      visualizeSet: update(
        this.state.visualizeSet, {
          data: { $set: frequencyData }
        }
      )
    });
  }
  handlePlay(e) {
    const audioContext = this.audioContext,
      source = audioContext.createMediaElementSource(e.target),
      analyser = this.analyser;

    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
  useMic() {
    navigator.getUserMedia({ audio: true }, (stream) => {
      const audioContext = this.acMic,
        analyser = this.anMic,
        microphone = audioContext.createMediaStreamSource(stream);

      microphone.connect(analyser);
      analyser.connect(audioContext.destination);
    }, (error) => { console.log(error); });
  }
  fileChange(e) {
    const files = e.target.files,
      playlist = this.state.playlist;

    for (let i = 0; i < files.length; i++) {
      let file = files[i],
        dataFile = URL.createObjectURL(file);

      // wrapping Ojbect
      const music = {};

      // read Audio metaData
      jsmediatags.read(file, {
        onSuccess: tag => {
          let tags = tag.tags,
            album = tags.album,
            title = tags.title,
            artist = tags.artist,
            cover = tags.picture;

          if (cover) {
            // metaData to Image 
            let base64String = "";
            cover.data.forEach(data => { base64String += String.fromCharCode(data) });
            // base64 dataImage
            cover = "data:" + cover.format + ";base64," + window.btoa(base64String);
          }

          //set ojbect audioData
          music.audioData = {
            src: dataFile,
            album: album,
            title: title,
            artist: artist,
            cover: cover
          }

          // push to array
          playlist.push(music);

          // when finished
          if (i == files.length - 1) whenFinished();
        },
        onError: error => {
          Toast('Failed to read file', 'default');
        }
      });
    }// end for Loop  

    // update playlist state;
    const whenFinished = () => {
      if (files.length > 0) Toast(`${files.length} songs have been added to the playlist`, 'default');

      this.setState({ playlist: playlist });

      if (!this.state.audioData.src) this.changeState_audioData(playlist[playlist.length - 1].audioData);
    }
  }
  changeState_colors(image) {
    const coverImage = new Image();
    coverImage.src = image;
    coverImage.onload = () => {
      //read Color from dataImage
      const colorThief = new ColorThief(),
        colorArray = colorThief.getPalette(coverImage, 2);

      this.setState({
        colors: update(
          this.state.colors, {
            main: { $set: 'rgb(' + colorArray[1].join(',') + ')' },
            sub: { $set: 'rgb(' + colorArray[0].join(',') + ')' }
          }
        )
      });
    };
  }
  changeState_audioData(obj) {
    this.setState({
      audioData: update(
        this.state.audioData, {
          src: { $set: obj.src },
          album: { $set: obj.album },
          title: { $set: obj.title },
          artist: { $set: obj.artist },
          cover: { $set: obj.cover },
        }
      )
    }, () => {
      this.setState({ lyrics: [], scroll: 0.5 });
      // find lyrics
      this.getLyrics(this.state.audioData.artist, this.state.audioData.title);
      // change Colors      
      this.changeState_colors(this.state.audioData.cover);
    });
  }
  handleLyricsBtn() {
    this.setState({ showLyrics: !this.state.showLyrics });
  }
  colorReversal() {
    this.setState({
      colors: update(
        this.state.colors, {
          main: { $set: this.state.colors.sub },
          sub: { $set: this.state.colors.main }
        }
      )
    });
  }
  // when lyrics Component Mounted
  lyricsMounted() {
    const lyrics = document.querySelector('.lyrics');
    lyrics.addEventListener('mousewheel', this.wheelEvent);
    lyrics.addEventListener('DOMMouseScroll', this.wheelEvent);
  }
  wheelEvent(e) {
    // e.deltaY > 0 ? Down : Up
    let deltaY = e.deltaY > 0 ? -3 : 3;

    if (this.state.scroll + deltaY <= -100 || this.state.scroll + deltaY >= 1) {
      this.setState({ scroll: this.state.scroll });
    } else {
      this.setState({ scroll: this.state.scroll + deltaY });
    }
  }
  // show form
  openFindLyrics() {
    this.setState({ findLyrics: !this.state.findLyrics });
  }
  // submit form
  findLyrics(e) {
    e.preventDefault();

    let artist = e.target.elements[0].value,
      title = e.target.elements[1].value;

    this.getLyrics(artist, title);
  }
  // ajax request to Find Lyrics
  getLyrics(artist, title) {
    // alert
    if (!this.state.showLyrics) Toast('Only lyrics in English can be searched', 'default');
    axios.get(`https://young-savannah-79010.herokuapp.com/lyrics/${artist}/${title}`)
      .then((response) => {
        let data = response.data;
        this.setState({ lyrics: data ? data.split('\n') : this.state.lyrics });

        data ? Toast('Lyrics Found!', 'success') : Toast('Lyrics Not Found!', 'default');
        if (data) this.setState({ showLyrics: true, findLyrics: false });
      }).catch((error) => { console.log(error); });
  }
  showPlaylist() {
    this.setState({ showPlaylist: !this.state.showPlaylist });
  }
  changeMusic(num) {
    this.changeState_audioData(this.state.playlist[num].audioData);
  }
  render() {
    const styles = {
      color: this.state.colors.sub,
      backgroundColor: this.state.colors.main,
      backgroundImage: this.state.audioData.cover
    }
    return (
      <div className="wrapper" style={styles} >
        <Header />
        <Controller
          color={this.state.colors.sub}
          src={this.state.audioData.src}

          handlePlay={this.handlePlay}
          fileChange={this.fileChange}
          handleSubmit={this.findLyrics}

          handleLyricsBtn={this.handleLyricsBtn}
          handleFindLyricsBtn={this.openFindLyrics}
          handleReversalBtn={this.colorReversal}
          handleMicBtn={this.useMic}

          findLyrics={this.state.findLyrics}
          showLyrics={this.state.showLyrics}
        />
        <Visualizer
          class={this.state.showLyrics ? 'visualizer showLyrics' : 'visualizer'}
          color={this.state.colors.sub}
          data={this.state.audioData}
          settings={this.state.visualizeSet}
          isMounted={this.visualizing}
        />
        <Lyrics
          class={this.state.showLyrics ? 'lyrics showLyrics' : 'lyrics'}
          color={this.state.colors.main}
          data={this.state.lyrics}
          scroll={this.state.scroll}
          lyricsMounted={this.lyricsMounted}
        />
        <Playlist
          class={this.state.showPlaylist ? 'playlist show' : 'playlist'}
          color={this.state.colors}
          playlist={this.state.playlist}
          changeMusic={this.changeMusic}
          handlePlaylistBtn={this.showPlaylist}
          audioData={this.state.audioData}
        />
      </div>
    );
  }
}

export default App;