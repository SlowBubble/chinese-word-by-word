
export let chineseVoice = null;

export function setupVoice(dialect) {
  if (!chineseVoice) {
    const voices = speechSynthesis.getVoices();
    const zhVoices = voices.filter(voice => voice.lang.startsWith(`zh-${dialect}`));
    const zhGoogleVoices = zhVoices.filter(voice => voice.name.startsWith("Google"));
    const voicesToUse = zhGoogleVoices.length > 0 ? zhGoogleVoices : zhVoices;
    if (voicesToUse.length > 0) {
      // pick a random one
      const randomIndex = Math.floor(Math.random() * voicesToUse.length);
      chineseVoice = voicesToUse[randomIndex];
      console.log(voicesToUse);
      console.log(chineseVoice);
    } else {
      // Display a banner to retry.
      const banner = document.createElement("div");
      banner.style.position = "fixed";
      banner.style.top = "0";
      banner.style.left = "0";
      banner.style.right = "0";
      banner.style.backgroundColor = "black";
      banner.style.color = "white";
      banner.style.padding = "10px";
      banner.style.textAlign = "center";
      banner.style.zIndex = "9999";
      banner.textContent = "Loading voices. Please press space again.";
      document.body.appendChild(banner);
      setTimeout(() => {
        document.body.removeChild(banner);
      }, 2000);
    }
    // chineseVoice = voices.find(voice => voice.lang.startsWith("zh-HK"));
  }
}