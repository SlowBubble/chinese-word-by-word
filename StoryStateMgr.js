import { toSimplified } from "./lib/t2s.js";
import { chineseVoice } from "./voice.js";

export class Story {
  constructor(text) {
    // Use \n as the delimiter for simplicity
    this.isGirlStory = false;
    this.sentences = text.trim().split('\n').filter(line => {
      const possKeyVal = line.split('=');
      if (possKeyVal.length < 2) {
        return true;
      }
      if (possKeyVal['0'] === 'isGirlStory') {
        this.isGirlStory = true;
      }
      return false;
    }).map(sentence => sentence.trim());
    this.sentences.push('完結');
    this.wordListsList = this.sentences.map(sentence => sentence.split('|'));
    this.sentenceLengthsInWords = this.wordListsList.map(wordList => wordList.length);
    const hash = Math.abs(hashCode(text))
    if (this.isGirlStory) {
      this.hue = (hash % 160) + 220;
    } else {
      this.hue = (hash % 200) + 20;
    }
    this.saturation = (hash % 23) + 50;
    this.lightness = (hash % 3) + 95;
  }
}

export class Cursor {
  constructor() {
    this.reset();
  }
  reset() {
    this.storyIdx = 0;
    this.sentenceIdx = 0;
    this.wordStartIdx = 0;
  }
  clone() {
    const res = new Cursor();
    res.storyIdx = this.storyIdx;
    res.sentenceIdx = this.sentenceIdx;
    res.wordStartIdx = this.wordStartIdx;
    return res;
  }
}
export class StoryStateMgr {
  constructor(storyCard, useSimplified = true) {
    this.useSimplified = useSimplified;
    this.storyCard = storyCard;
    this.isBusyReading = false;
    this.stories = [];
    this.cursor = new Cursor();
  }
  // Must call this for things to start working
  loadStories(arrayOfText, readPhrase = false, readSentence = false, nameReplacements = []) {
    if (this.isBusyReading) {
      return;
    }
    const replaceFunc = text => {
      if (!readPhrase) {
        text = text.replaceAll(' ', '|');
      }
      if (readSentence) {
        text = text.replaceAll('|', ' ');
      }
      nameReplacements.forEach(mapping => {
        new RegExp(`$\b{mapping.old}\b`, "i")
        text = text.replaceAll(mapping.old, mapping.new);
      });
      if (this.useSimplified) {
        text = toSimplified(text);
      }
      return text;
    }
    this.stories = arrayOfText.map(text => new Story(replaceFunc(text)));
    this.cursor.reset();
    this.renderStoryCard();
  }
  getCurrStory() {
    return this.stories[this.cursor.storyIdx];
  }

  computeNextCursor() {
    const cursor = this.cursor.clone();
    const story = this.getCurrStory();
    cursor.wordStartIdx += 1;
    if (cursor.wordStartIdx < story.sentenceLengthsInWords[cursor.sentenceIdx]) {
      return cursor;
    }
    cursor.wordStartIdx = 0;
    cursor.sentenceIdx += 1;
    if (cursor.sentenceIdx < story.sentences.length) {
      return cursor;
    }
    cursor.sentenceIdx = 0;
    cursor.storyIdx += 1
    cursor.storyIdx = cursor.storyIdx % this.stories.length;
    return cursor;
  }

  computePreviousCursor() {
    const cursor = this.cursor.clone();
    if (cursor.wordStartIdx > 0) {
      cursor.wordStartIdx -= 1;
      return cursor;
    }
    
    if (cursor.sentenceIdx > 0) {
      cursor.sentenceIdx -= 1;
      const story = this.getCurrStory();
      cursor.wordStartIdx = story.sentenceLengthsInWords[cursor.sentenceIdx] - 1;
      return cursor;
    }
    
    if (cursor.storyIdx > 0) {
      cursor.storyIdx -= 1;
      const story = this.stories[cursor.storyIdx];
      cursor.sentenceIdx = story.sentences.length - 1;
      cursor.wordStartIdx = story.sentenceLengthsInWords[cursor.sentenceIdx] - 1;
      return cursor;
    }
    
    return cursor;
  }

  moveToNextWord() {
    if (this.isBusyReading) {
      return false;
    }
    this.cursor = this.computeNextCursor();
    // const nextSentenceIsReached = nextCursor.sentenceIdx !== this.cursor.sentenceIdx;
    // const endIsReached = nextCursor.storyIdx !== this.cursor.storyIdx;
    this.cursor = nextCursor;
    this.renderStoryCard();
  }

  moveToPreviousWord() {
    if (this.isBusyReading) {
      return false;
    }
    this.cursor = this.computePreviousCursor();
    this.renderStoryCard();
  }

  async readWordAndMoveToNextWord() {
    if (this.isBusyReading) {
      return false;
    }
    const story = this.getCurrStory();
    const word = story.wordListsList[this.cursor.sentenceIdx][this.cursor.wordStartIdx];
    const nextCursor = this.computeNextCursor();
    const nextSentenceIsReached = nextCursor.sentenceIdx !== this.cursor.sentenceIdx;
    const endIsReached = nextCursor.sentenceIdx === story.sentences.length - 1;
    this.isBusyReading = true;
    await utter(word, nextSentenceIsReached ? 1000 : 0);
    this.isBusyReading = false;
    // TODO compute before updating so that we can delay moving to the next page
    this.cursor = nextCursor;
    this.renderStoryCard(endIsReached);
  }

  renderStoryCard(endIsReached = false) {
    const story = this.getCurrStory();
    this.storyCard.render(
      story.wordListsList[this.cursor.sentenceIdx], this.cursor.wordStartIdx,
      endIsReached,
      this.cursor.sentenceIdx % 2 === 1,
      story.hue, story.saturation, story.lightness);
  }

  moveToNextStory() {
    if (this.isBusyReading) {
      return;
    }
    this.cursor.storyIdx = (this.cursor.storyIdx + 1) % this.stories.length;
    this.cursor.sentenceIdx = 0;
    this.cursor.wordStartIdx = 0;
    this.renderStoryCard();
  }

  moveToPreviousStory() {
    if (this.isBusyReading) {
      return;
    }
    this.cursor.storyIdx = (this.cursor.storyIdx - 1 + this.stories.length) % this.stories.length;
    this.cursor.sentenceIdx = 0;
    this.cursor.wordStartIdx = 0;
    this.renderStoryCard();
  }
}
async function utter(sentence, delayMs = 0, rate = 0.8) {
  console.log(sentence);
  return new Promise(resolve => {
    const speechSynthesisUtterance = new SpeechSynthesisUtterance(sentence);
    // Find the first Chinese voice (e.g., language code zh-CN)
    if (chineseVoice) {
      speechSynthesisUtterance.voice = chineseVoice;
    }
    speechSynthesisUtterance.rate = rate;
    speechSynthesisUtterance.onend = function(evt) {
      window.setTimeout(_ => {
        resolve();
      }, delayMs);
    }
    window.speechSynthesis.speak(speechSynthesisUtterance);
  });
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

