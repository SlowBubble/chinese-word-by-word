
export class StoryCard extends HTMLElement {
  constructor() {
    super();
  }

  render(wordList, wordIdx, putAtCenter, putAtBottom = false, hue = 100, saturation = 100, lightness = 100) {
    const annotatedWords = wordList.map((word, idx) => idx === wordIdx ? `<span style='color:red'>${word}</span>` : word);
    this.innerHTML = genHtml(annotatedWords.join(' '), putAtCenter, putAtBottom, hue, saturation, lightness);
  }
}

// 20-220 are boys color
// 60-100
// 80-95
const genHtml = (sentenceHtml, putAtCenter, putAtBottom, hue = 100, saturation = 100, lightness = 100) => `
<style>
#story-card {
  display: flex;
  align-items: ${putAtCenter ? "center" : (putAtBottom ? "flex-end" : "flex-start")};
  ${putAtCenter ? "justify-content: center;" : ""}
  background: hsl(${hue}, ${saturation}%, ${lightness}%);
  width: 700px;
  height: 500px;
  font-size: 84px;
  border: solid 2px black;
}
</style>
<div id='story-card'>
 <div>${sentenceHtml}</div>
</div>
`;

customElements.define('story-card', StoryCard);
