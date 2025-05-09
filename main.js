import { StoryCard } from './StoryCardComponent.js';
import { StoryStateMgr } from './StoryStateMgr.js'
import { getUrlParamsMap } from "./url.js";
import { sanitizeName } from "./sanitizeName.js";
import { stories } from './stories.js';
import { chineseVoice, setupVoice } from './voice.js';


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
let dialect = 'CN';

function main() {
  const paramsMap = getUrlParamsMap();
  const nameReplacements = [];
  let readPhrase = false;
  let readSentence = false;
  let shuffleStories = false;
  let startIndex = 0;
  let useSimplified = true;
  paramsMap.forEach((value, key) => {
    const possName = sanitizeName(value);
    if (!possName || !key) {
      return;
    }
    if (key === 'read_phrase') {
      readPhrase = true;
    }
    if (key === 'read_sentence') {
      readSentence = true;
    }
    if (key === 'shuffle_stories') {
      shuffleStories = true;
    }
    if (key === 'use_hk') {
      dialect = 'HK';
      useSimplified = false;
    }
    if (key === 'use_tw') {
      dialect = 'TW';
      useSimplified = false;
    }
    if (key === 'start_index') {
      const possibleInt = parseInt(value);
      if (!isNaN(possibleInt)) {
        startIndex = possibleInt;
      }
    }
    nameReplacements.push({
      'old': key,
      'new': possName,
    });
    if (key[0].toLowerCase() === key[0] && possName[0].toLowerCase() === possName[0]) {
      nameReplacements.push({
      'old': capitalizeFirstLetter(key),
      'new': capitalizeFirstLetter(possName),
    });
    }
  });
  const storyCard = new StoryCard();
  document.body.appendChild(storyCard);
  const storyStateMgr = new StoryStateMgr(storyCard, useSimplified);

  let storiesClone = [...stories];
  if (startIndex) {
    storiesClone = stories.slice(startIndex).concat(stories.slice(0, startIndex));
  }
  if (shuffleStories) {
    shuffleArray(storiesClone);
  }
  storyStateMgr.loadStories(storiesClone, readPhrase, readSentence, nameReplacements);

  setupKeyboardControl(storyStateMgr);
}

function setupKeyboardControl(storyStateMgr) {
  document.body.onkeyup = evt => {
    if (evt.key == " ") {
      if (!chineseVoice) {
        setupVoice(dialect);
      }
      if (chineseVoice) {
        storyStateMgr.readWordAndMoveToNextWord();
      }
    } else if (evt.key == "ArrowLeft") {
      storyStateMgr.moveToPreviousWord();
    } else if (evt.key == "n") {
      storyStateMgr.moveToNextStory();
    } else if (evt.key == "p") {
      storyStateMgr.moveToPreviousStory();
    }
  };
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

main();


