//  LauncherOSX
//
//  Created by Boris Schneiderman.
// Modified by Daniel Weck, Andrey Kavarma
//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
//  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
//  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
//  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
//  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
//  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
//  OF THE POSSIBILITY OF SUCH DAMAGE.


define([],function() {

    /**
     *
     * @param onStatusChanged
     * @param onPositionChanged
     * @param onAudioEnded
     * @param onAudioPlay
     * @param onAudioPause
     * @constructor
     */
    var AudioPlayer = function(onStatusChanged, onPositionChanged, onAudioEnded, onAudioPlay, onAudioPause)
    {
        var _iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;
        var _Android = navigator.userAgent.toLowerCase().indexOf('android') > -1;
        var _isMobile = _iOS || _Android;

        //var _isReadiumJS = typeof window.requirejs !== "undefined";

        var DEBUG = false;

        var _audioElement = new Audio();
        
        if (DEBUG)
        {
            _audioElement.addEventListener("load", function()
                {
                    consoleLog("0) load");
                }
            );

            _audioElement.addEventListener("loadstart", function()
                {
                    consoleLog("1) loadstart");
                }
            );

            _audioElement.addEventListener("durationchange", function()
                {
                    consoleLog("2) durationchange");
                }
            );

            _audioElement.addEventListener("loadedmetadata", function()
                {
                    consoleLog("3) loadedmetadata");
                }
            );

            _audioElement.addEventListener("loadeddata", function()
                {
                    consoleLog("4) loadeddata");
                }
            );

            _audioElement.addEventListener("progress", function()
                {
                    consoleLog("5) progress");
                }
            );

            _audioElement.addEventListener("canplay", function()
                {
                    consoleLog("6) canplay");
                }
            );

            _audioElement.addEventListener("canplaythrough", function()
                {
                    consoleLog("7) canplaythrough");
                }
            );

            _audioElement.addEventListener("play", function()
                {
                    consoleLog("8) play");
                }
            );

            _audioElement.addEventListener("pause", function()
                {
                    consoleLog("9) pause");
                }
            );

            _audioElement.addEventListener("ended", function()
                {
                    consoleLog("10) ended");
                }
            );

            _audioElement.addEventListener("seeked", function()
                {
                    consoleLog("X) seeked");
                }
            );

            _audioElement.addEventListener("timeupdate", function()
                {
                    consoleLog("Y) timeupdate");
                }
            );

            _audioElement.addEventListener("seeking", function()
                {
                    consoleLog("Z) seeking");
                }
            );
        }

        var self = this;
     
        //_audioElement.setAttribute("preload", "auto");
    
        var _currentEpubSrc = undefined;
    
        var _currentSmilSrc = undefined;
        this.currentSmilSrc = function() {
            return _currentSmilSrc;
        };

        var _rate = 1.0;
        this.setRate = function(rate)
        {
            _rate = rate;
            if (_rate < 0.5)
            {
                _rate = 0.5;
            }
            if (_rate > 4.0)
            {
                _rate = 4.0;
            }
    
            _audioElement.playbackRate = _rate;
        }
        self.setRate(_rate);
        this.getRate = function()
        {
            return _rate;
        }
    
    
        var _volume = 1.0;
        this.setVolume = function(volume)
        {
            _volume = volume;
            if (_volume < 0.0)
            {
                _volume = 0.0;
            }
            if (_volume > 1.0)
            {
                _volume = 1.0;
            }
            _audioElement.volume = _volume;
        }
        self.setVolume(_volume);
        this.getVolume = function()
        {
            return _volume;
        }
    
        this.play = function()
        {
            if (DEBUG)
            {
                consoleError("this.play()");
            }
    
            if(!_currentEpubSrc)
            {
                return false;
            }
    
            startTimer();
    
            self.setVolume(_volume);
            self.setRate(_rate);
    
            _audioElement.play();
    
            return true;
        };
    
        this.pause = function()
        {
            if (DEBUG)
            {
                consoleError("this.pause()");
            }
    
            stopTimer();
    
            _audioElement.pause();
        };
    
        _audioElement.addEventListener('play', onPlay, false);
        _audioElement.addEventListener('pause', onPause, false);
        _audioElement.addEventListener('ended', onEnded, false);
    
        function onPlay()
        {
            onStatusChanged({isPlaying: true});
            onAudioPlay();
        }
    
        function onPause()
        {
            onAudioPause();
            onStatusChanged({isPlaying: false});
        }
    
        function onEnded()
        {
            if (_audioElement.moSeeking)
            {
                if (DEBUG)
                {
                    consoleLog("onEnded() skipped (still seeking...)");
                }
    
                return;
            }
    
            stopTimer();
    
            onAudioEnded();
            onStatusChanged({isPlaying: false});
        }
        
        var _intervalTimerSkips = 0;
        
        var _intervalTimer = undefined;
        function startTimer()
        {
            if(_intervalTimer)
            {
                return;
            }
    
            _intervalTimer = setInterval(
                function()
                {
                    if (_audioElement.moSeeking)
                    {
                        if (DEBUG)
                        {
//consoleLog("interval timer skipped (still seeking...)");
                        }
                                         
                        _intervalTimerSkips++;
                        if (_intervalTimerSkips > 1000)
                        {
                            _intervalTimerSkips = 0;
                            stopTimer();
                        }
                        return;
                    }
                    
                    var currentTime = undefined;
                    try
                    {
                        currentTime = _audioElement.currentTime;
                    }
                    catch (ex)
                    {
                        consoleError(ex.message);
                    }
    
    //                if (DEBUG)
    //                {
    //                    consoleLog("currentTime: " + currentTime);
    //                }
    
                    if (currentTime)
                    {
                        onPositionChanged(currentTime, 1);
                    }
                }, 20);
        }
    
        function stopTimer()
        {
            if (_intervalTimer)
            {
                clearInterval(_intervalTimer);
            }
            _intervalTimer = undefined;
        }
    
        this.isPlaying = function()
        {
            return _intervalTimer !== undefined;
        };
    
        this.reset = function()
        {
            if (DEBUG)
            {
                consoleError("this.reset()");
            }
    
            this.pause();
    
            _audioElement.moSeeking = undefined;
    
            _currentSmilSrc = undefined;
            _currentEpubSrc = undefined;
    
            setTimeout(function()
            {
                _audioElement.setAttribute("src", "");
            }, 1);
        };
    

        _audioElement.addEventListener("loadstart", function()
            {
                _touchInited = true;
            }
        );
        var _touchInited = false;
        this.touchInit = function()
        {
            if (!_iOS)
            {
                return false;
            }
    
            if (_touchInited)
            {
                return false;
            }
    
            _touchInited = true;
    
            _audioElement.setAttribute("src", "touch/init/html5/audio.mp3");
            _audioElement.load();
    
            return true;
        };
    
        var _playId = 0;
    
        var _seekQueuing = 0;
        
        this.playFile = function(smilSrc, epubSrc, seekBegin) //element
        {
            _playId++;
            if (_playId > 99999)
            {
                _playId = 0;
            }
    
            var playId = _playId;
    
            if (_audioElement.moSeeking)
            {
                _seekQueuing++;
                if (_seekQueuing > MAX_SEEK_RETRIES)
                {
                    _seekQueuing = 0;
                    return;
                }
                
                if (DEBUG)
                {
                    consoleLog("this.playFile(" + epubSrc + ")" + " @" + seekBegin + " (POSTPONE, SEEKING...)");
                }
    
                setTimeout(function()
                {
                    self.playFile(smilSrc, epubSrc, seekBegin);
                }, 20);
                
                return;
            }
    
            _audioElement.moSeeking = {};
    
            if (DEBUG)
            {
                consoleLog("this.playFile(" + epubSrc + ")" + " @" + seekBegin + " #" + playId);
            }
    
            var audioNeedsNewSrc = !_currentEpubSrc || _currentEpubSrc !== epubSrc;
    
            if (!audioNeedsNewSrc)
            {
                if (DEBUG)
                {
                    consoleLog("this.playFile() SAME SRC");
                }
    
                this.pause();
    
                _currentSmilSrc = smilSrc;
                _currentEpubSrc = epubSrc;
    
                playSeekCurrentTime(seekBegin, playId, false);
    
                return;
            }
    
            if (DEBUG)
            {
                consoleLog("this.playFile() NEW SRC");
                consoleLog("_currentEpubSrc: " + _currentEpubSrc);
                consoleLog("epubSrc: " + epubSrc);
            }
    
            this.reset();
            _audioElement.moSeeking = {};
    
            _currentSmilSrc = smilSrc;
            _currentEpubSrc = epubSrc;
    
            //element.parentNode.insertBefore(_audioElement, element); //element.parentNode.childNodes[0]);
            
            if (!_Android)
            {
                _audioElement.addEventListener('play', onPlayToForcePreload, false);
            }
    
            $(_audioElement).on(_readyEvent, {seekBegin: seekBegin, playId: playId}, onReadyToSeek);
            
            setTimeout(function()
            {
                   _audioElement.setAttribute("src", _currentEpubSrc);
                   // _audioElement.src = _currentEpubSrc;
                   // $(_audioElement).attr("src", _currentEpubSrc);
    
                   // if (_Android)
                   // {
                   //     _audioElement.addEventListener('loadstart', onReadyToPlayToForcePreload, false);
                   // }
                   
                   _audioElement.load();
    
                   if (!_Android)
                   {
                       playToForcePreload();
                   }
            }, 1);
        };
    
        // var onReadyToPlayToForcePreload = function ()
        // {
        //     _audioElement.removeEventListener('loadstart', onReadyToPlayToForcePreload, false);
        //     
        //     if (DEBUG)
        //     {
        //         consoleLog("onReadyToPlayToForcePreload");
        //     }
        //     
        //     playToForcePreload();
        // };
        
        var playToForcePreload = function()
        {
            if (DEBUG)
            {
                consoleLog("playToForcePreload");
            }
            
            //_audioElement.volume = 0;
            //_audioElement.play();
            var vol = _volume;
            _volume = 0;
            self.play();
            _volume = vol;
        };
    
        var onPlayToForcePreload = function ()
        {
            _audioElement.removeEventListener('play', onPlayToForcePreload, false);
            
            if (DEBUG)
            {
                consoleLog("onPlayToForcePreload");
            }
            _audioElement.pause(); // note: interval timer continues (immediately follows self.play())
        };
    
        var _readyEvent = _Android ? "canplaythrough" : "canplay";
        function onReadyToSeek_(event)
        {
            if (DEBUG)
            {
                consoleLog("onReadyToSeek #" + event.data.playId);
            }
            playSeekCurrentTime(event.data.seekBegin, event.data.playId, true);
        }
        function onReadyToSeek(event)
        {
            $(_audioElement).off(_readyEvent, onReadyToSeek);
            
            if (!_Android)
            {
                onReadyToSeek_(event);
            }
            else
            {
                if (DEBUG)
                {
                    consoleLog("onReadyToSeek ANDROID ... waiting a bit ... #" + event.data.playId);
                }
                
                //self.play();
                playToForcePreload();
                
                setTimeout(function() {
                    onReadyToSeek_(event);
                }, 1000);
            }
        }
    
        function playSeekCurrentTime(newCurrentTime, playId, isNewSrc)
        {
            if (DEBUG)
            {
                consoleLog("playSeekCurrentTime() #" + playId);
            }
    
            if (newCurrentTime == 0)
            {
                newCurrentTime = 0.01;
            }
    
            if(Math.abs(newCurrentTime - _audioElement.currentTime) < 0.3)
            {
                if (DEBUG)
                {
                    consoleLog("playSeekCurrentTime() CONTINUE");
                }
    
                _audioElement.moSeeking = undefined;
                self.play();
                return;
            }
    
            var ev = isNewSrc ? _seekedEvent1 : _seekedEvent2;
    
            if (DEBUG)
            {
                consoleLog("playSeekCurrentTime() NEED SEEK, EV: " + ev);
            }
    
            self.pause();
    
            $(_audioElement).on(ev, {newCurrentTime: newCurrentTime, playId: playId, isNewSrc: isNewSrc}, onSeeked);
    
            try
            {
                _audioElement.currentTime = newCurrentTime;
            }
            catch (ex)
            {
                consoleError(ex.message);
    
                setTimeout(function()
                {
                    try
                    {
                        _audioElement.currentTime = newCurrentTime;
                    }
                    catch (ex)
                    {
                        consoleError(ex.message);
                    }
                }, 5);
            }
        }
        
        var MAX_SEEK_RETRIES = 10;
        var _seekedEvent1 = _iOS ? "canplaythrough" : "seeked"; //"progress"
        var _seekedEvent2 = _iOS ? "timeupdate" : "seeked";
        function onSeeked(event)
        {
            var ev = event.data.isNewSrc ? _seekedEvent1 : _seekedEvent2;
    
            var notRetry = event.data.seekRetries == undefined;
    
            if (notRetry || event.data.seekRetries == MAX_SEEK_RETRIES) // first retry
            {
                $(_audioElement).off(ev, onSeeked);
            }
    
            if (DEBUG)
            {
                consoleLog("onSeeked() #" + event.data.playId + " FIRST? " + notRetry + " EV: " + ev);
            }
    
            var curTime = _audioElement.currentTime;
            var diff = Math.abs(event.data.newCurrentTime - curTime);
    
            if((notRetry || event.data.seekRetries >= 0) &&
                diff >= 1)
            {
                if (DEBUG)
                {
                    consoleLog("onSeeked() time diff: " + event.data.newCurrentTime + " vs. " + curTime + " ("+diff+")");
                }
                
                if (notRetry)
                {
                    event.data.seekRetries = MAX_SEEK_RETRIES;
    
                    // if (DEBUG)
                    // {
                    //     consoleLog("onSeeked() fail => first retry, EV: " + _seekedEvent2);
                    // }
    
                    event.data.isNewSrc = false;
                    //$(_audioElement).on(_seekedEvent2, event.data, onSeeked);
                }
                
                //else
                {
                    event.data.seekRetries--;
    
                    if (DEBUG)
                    {
                        consoleLog("onSeeked() FAIL => retry again (timeout)");
                    }
    
                    setTimeout(function()
                    {
                        onSeeked(event);
                    }, _Android ? 1000 : 200);
                }
    
                setTimeout(function()
                {
                    _audioElement.pause();
                    try
                    {
                        _audioElement.currentTime = event.data.newCurrentTime;
                    }
                    catch (ex)
                    {
                        consoleError(ex.message);
    
                        setTimeout(function()
                        {
                            try
                            {
                                _audioElement.currentTime = event.data.newCurrentTime;
                            }
                            catch (ex)
                            {
                                consoleError(ex.message);
                            }
                        }, 4);
                    }
                }, 5);
            }
            else
            {
                if (DEBUG)
                {
                    consoleLog("onSeeked() STATE:");
                    consoleLog(notRetry);
                    consoleLog(event.data.seekRetries);
                    consoleLog(diff);
                }
    
                if (diff >= 1)
                {
                    if (DEBUG)
                    {
                        consoleLog("onSeeked() ABORT, TRY AGAIN FROM SCRATCH!");
                    }
                    
                    var smilSrc = _currentSmilSrc;
                    var epubSrc = _currentEpubSrc;
                    var seekBegin = event.data.newCurrentTime;
                    
                    self.reset();
                    
                    setTimeout(function()
                    {
                        self.playFile(smilSrc, epubSrc, seekBegin);
                    }, 10);
                    
                    return;
                }

                if (DEBUG)
                {
                    consoleLog("onSeeked() OKAY => play!");
                }
                
                event.data.seekRetries = undefined;
    
                self.play();
    
                _audioElement.moSeeking = undefined;
            }
        }
    };

    return AudioPlayer;
});
