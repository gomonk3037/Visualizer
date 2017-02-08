import React from 'react';

const Control = (props) => {
  const color = {
    color: props.color.sub
  }
  const active = {
    backgroundColor: props.color.sub,
    color: props.color.main
  }
  return (
    <div className={props.class}>
      <button style={color} onClick={props.prevMusic}>
        <i className='step backward icon'></i>
      </button>
      <button style={color} onClick={props.musicPlayControl}>
        {props.playing
          ? <i className='pause icon'></i>
          : <i className='play icon'></i>
        }
      </button>
      <button style={color} onClick={props.nextMusic}>
        <i className='step forward icon'></i>
      </button>
      <button
        style={props.useRandom ? active : color}
        className={props.useRandom ? 'active' : ''}
        onClick={props.random}>
        <i className='random icon'></i>
      </button>
      <button
        style={props.useRepeat ? active : color}
        className={props.useRepeat ? 'active' : ''}
        onClick={props.repeat}>
        <i className='repeat icon'></i>
      </button>
    </div>
  );
};

export default Control;