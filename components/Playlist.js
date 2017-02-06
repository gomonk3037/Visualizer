import React, { Component } from 'react';

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    this.props.changeMusic(e.target.dataset.num);
  }
  render() {
    const style = {
      backgroundColor: this.props.color.sub,
      color: this.props.color.main
    }
    return (
      <div className={this.props.class}>
        <div className="backdrop" onClick={this.props.handlePlaylistBtn}></div>
        <NowPlaying onClick={this.props.handlePlaylistBtn}
          class="nowPlaying"
          data={this.props.audioData}
        />
        <div className="playlist__item-wrapper">
          {this.props.playlist.map((data, i) => {
            const style = {
              transitionDelay: i / 13 + 's'
            }
            return (
              <Item
                key={i} num={i}
                class="playlist__item"
                album={data.audioData.album}
                title={data.audioData.title}
                artist={data.audioData.artist}
                cover={data.audioData.cover}
                css={style}
                onClick={this.handleClick}
              />
            )
          })}
        </div>
      </div>
    );
  }
}

const Item = (props) => {
  return (
    <div
      onClick={props.onClick}
      style={props.css}
      className={props.class}
      data-num={props.num} >
      <img className={props.class + '-cover'} src={props.cover} />
      <div className={props.class + '-infoBox'}>
        <span className={props.class + '-title'}>{props.title}</span>
        <span className={props.class + '-artist'}>{props.artist}</span>
        <span className={props.class + '-album'}>{props.album}</span>
      </div>
    </div>
  );
};

const NowPlaying = (props) => {
  return (
    <div className={props.class} onClick={props.onClick}>
      <img className={props.class + '-cover'} src={props.data.cover} />
      <div className={props.class + '-infoBox'}>
        <span className={props.class + '-title'}>{props.data.title}</span>
        <span className={props.class + '-artist'}>{props.data.artist}</span>
        <span className={props.class + '-album'}>{props.data.album}</span>
      </div>
    </div>
  );
};

export default Playlist;