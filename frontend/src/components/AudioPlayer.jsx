"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import "../assets/audio-player.css";

function AudioPlayer({ sonido, isPlaying, onPlay, onClose }) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayingState, setIsPlayingState] = useState(isPlaying);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlayingState(isPlaying);
    if (isPlaying && audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error("Error al reproducir:", err));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlayingState(true);
      } else {
        audioRef.current.pause();
        setIsPlayingState(false);
      }
    }
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
      if (value > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player-container">
      <audio ref={audioRef} src={sonido?.url_sonidos || sonido?.url_sonido} />

      <div className="audio-player-content">
        <div className="audio-player-info">
          <span className="audio-player-title">
            {sonido?.nombre_sonido || sonido?.nombre || "Sonido"}
          </span>
        </div>

        <div className="audio-player-controls">
          <button
            className="audio-player-btn audio-player-play"
            onClick={togglePlayPause}
            title={isPlayingState ? "Pausar" : "Reproducir"}
          >
            {isPlayingState ? (
              <Pause size={20} strokeWidth={2.5} />
            ) : (
              <Play size={20} strokeWidth={2.5} />
            )}
          </button>

          <div className="audio-player-progress">
            <span className="audio-player-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="audio-player-slider"
              style={{
                background: `linear-gradient(to right, rgba(75, 30, 133, 1) 0%, rgba(75, 30, 133, 1) ${progressPercent}%, rgba(75, 30, 133, 0.2) ${progressPercent}%, rgba(75, 30, 133, 0.2) 100%)`,
              }}
            />
            <span className="audio-player-duration">
              {formatTime(duration)}
            </span>
          </div>

          <div className="audio-player-actions">
            <button
              className="audio-player-btn audio-player-volume"
              onClick={toggleMute}
              title={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? (
                <VolumeX size={18} strokeWidth={2.5} />
              ) : (
                <Volume2 size={18} strokeWidth={2.5} />
              )}
            </button>
            <div className="audio-player-volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="audio-player-volume-slider"
                title="Volumen"
              />
            </div>
            <button
              className="audio-player-btn audio-player-close"
              onClick={onClose}
              title="Cerrar"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
