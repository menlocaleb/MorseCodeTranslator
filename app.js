/* JS file for Morse Code App */



var mt = (function MorseTranslator() {

	var morseToText = {
	  "01": "a",
	  "1000": "b",
	  "1010": "c",
	  "100": "d",
	  "0": "e",
	  "0010": "f",
	  "110": "g",
	  "0000": "h",
	  "00": "i",
	  "0111": "j",
	  "101": "k",
	  "0100": "l",
	  "11": "m",
	  "10": "n",
	  "111": "o",
	  "0110": "p",
	  "1101": "q",
	  "010": "r",
	  "000": "s",
	  "1": "t",
	  "001": "u",
	  "0001": "v",
	  "011": "w",
	  "1001": "x",
	  "1011": "y",
	  "1100": "z"
	};

	var translator = {};
	translator.numTaps = 0;
	translator.taps = new Array();
	translator.text = "Translate";
	translator.inputKeyCode = 32; // spacebar
	translator.inputCurrentlyDown = false;
	translator.mostRecentDownTime = 0;
	translator.outputId = "text-output";
	translator.letterTimeOut = null;

	// TODO add parameter for how strict to time dots vs dashes

	var beatInterval = 0;


	translator.handleKeyDown = function(e) {

		// ensure proper input key
		if (e.keyCode !== translator.inputKeyCode) {
			return;
		}

		if (!translator.inputCurrentlyDown) {
			//console.log(e);
			translator.mostRecentDownTime = new Date();
		}
		translator.inputCurrentlyDown = true;
	}

	translator.handleKeyUp = function(e) {
		//console.log(e);

		// ensure proper input key
		if (e.keyCode !== translator.inputKeyCode) {
			return;
		}

		var upTime = new Date();

		// console.log(translator.taps);
		// console.log(translator);
		translator.taps.push({start: translator.mostRecentDownTime.getTime(), duration: upTime - translator.mostRecentDownTime});

		translator.inputCurrentlyDown = false;

		translator.translate();
	}

    // returns length of dot in milliseconds
	translator.getBeatInterval = function() {

		// TODO add dynamic beat discovery
		// for now make use type 'H' to establish beat

		// space between parts of the same letter is one beat
		// reliable way to find beat without differences between dot and dash
		// however, E and T are single tap letters, which provides a problem

		// validate for non-zero array length
		// also require at least 4 taps before calculate beat interval
		if (this.taps.length < 4) {
			return -1;
		}

		if (beatInterval !== 0) {
			return beatInterval;
		}

		console.log(this.taps);
		// compute as average of half the interval taps to ensure more valid calculation
		// corrects if user taps keys for less than one unit, which based on my testing is common
		var tapDurationSum = 0;
		for (var i = 1; i < 4; i++) {
	    	tapDurationSum = tapDurationSum + (this.taps[i].start - this.taps[i-1].start)/2;
		}	

		

		// assuming average of 1st 3 differences between taps is average dot duration
		beatInterval = tapDurationSum / 3;
		return beatInterval;
	}

	translator.getLetter = function(binaryString) {
		if (binaryString in morseToText) {
			return morseToText[binaryString];
		}

		// for now return empty string, in future could return "ERROR" or something
		return "";
	}

	// rules taken from here http://en.wikipedia.org/wiki/Morse_code
	translator.translate = function() {
		var unitLength = this.getBeatInterval();

		console.log(unitLength);

		// can't translate if haven't established beat yet
		if (unitLength === -1) {
			return;
		}

		clearTimeout(this.letterTimeOut);

		var text = "";

		var indexOfStartOfCurrentLetter = 4;
		var binaryWord = "";
		for (var i = 4; i < this.taps.length-1; i++) {
			if (this.taps[i].duration < unitLength * 1.5) {
	    		binaryWord = binaryWord + "0";
	    	} else if (this.taps[i].duration < unitLength * 4.5) {
	    		//var num = this.taps[i].duration / unitLength;
	    		binaryWord = binaryWord + "1";
	    	}

	    	var pauseAfterTap = this.taps[i+1].start - (this.taps[i].start+this.taps[i].duration);
			if (pauseAfterTap > 2.5 * unitLength) {
				// end of letter
				var letter = this.getLetter(binaryWord);
				binaryWord = "";
				indexOfStartOfCurrentLetter = i + 1;

				text = text + letter;

			}

			if (pauseAfterTap > 6.5 * unitLength) {
				// end of word
				text = text + " ";
			}

		}

		var outputField = document.getElementById(this.outputId);
		outputField.innerHTML = text;

		var lastTap = "";
		if (this.taps[this.taps.length-1].duration < unitLength * 1.5) {
    		lastTap = "0";
    	} else if (this.taps[this.taps.length-1].duration < unitLength * 4.5) {
    		//var num = this.taps[i].duration / unitLength;
    		lastTap = "1";
    	}
		// Finally need to add timer to finish letter or word if user is done rather than wait until next tap
		this.letterTimeOut = setTimeout(function(){
			
	    	var letter = translator.getLetter(binaryWord + lastTap);

			var outputField = document.getElementById(translator.outputId);
			outputField.innerHTML += letter;

		}, 4.5 * unitLength);

	}

	window.addEventListener("keydown", translator.handleKeyDown, false);
	window.addEventListener("keyup", translator.handleKeyUp, false);

	return translator;

})();


console.log(mt);

//mt.translate();