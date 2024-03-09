const userMessage = [
    ["hi", "hoi", "hallo", "hey"],
    ["zeker", "ja", "nee"],
    ["ben jij geniaal", "ben jij een nerd", "ben jij intelligent", "ben je super intelligent"],
    ["ik haat je", "ik vind je niet leuk"],
    ["hoe gaat het", "hoe gaat het met het leven", "hoe gaat het", "hoe gaat het met je"],
    ["hoe is het met corona", "hoe is het met covid 19", "hoe is de situatie met covid19"],
    ["wat ben je aan het doen", "wat is er aan de hand", "wat is er aan de hand"],
    ["hoe oud ben je", "wat is jouw leeftijd"],
    ["wie ben jij", "ben je een mens", "ben je een bot", "ben je een mens of een bot"],
    ["wie heeft jou gemaakt", "wie heeft jou gemaakt", "wie is jouw schepper"],
  
    [
      "uw naam alstublieft",
      "uw naam",
      "mag ik je Naam weten",
      "hoe heet je",
      "hoe noem jezelf",
      "wat is je naam",
      "hoe noem je",
      "je naam"
    ],
    ["ik houd van je"],
    ["blij", "goed", "leuk", "geweldig", "fantastisch", "cool", "zeer goed"],
    ["slecht", "verveeld", "moe"],
    ["help me", "vertel me een verhaal", "vertel me een grapje"],
    ["ah", "ok", "oké", "leuk", "welkom"],
    ["bedankt dank je"],
    ["wat moet ik vandaag eten"],
    ["broer"],
    ["wat", "waarom", "hoe", "waar", "wanneer"],
    ["corona", "covid19", "coronavirus"],
    ["jij bent grappig"],
    ["ik weet het niet"],
    ["saai"],
    ["ik ben moe"],
    ["wat is jouw lievelingseten"],
    ["vertel een grap", "vertel een mopje", "vertel een grapje"],
    ["wat is een dier"],
    ["ben je moe"],
    ["wat is je lievelingsdier"]
  ];
  const botReply = [
    ["Hallo!", "Hoi!", "Hey!", "Hi!"],
    ["Oké"],
    ["Ja dat ben ik!"],
    ["Sorry daarvoor. Maar ik vind je leuk kerel."],
    [
        "Goed hoe gaat het met jou?",
        "Best goed, hoe gaat het?",
        "Fantastisch, hoe gaat het?"
    ],
    ["Beter worden. Daar?", "Enigszins oké!", "Ja prima. Blijf liever thuis!"],
  
    [
      "Niet veel",
      "Op het punt om te gaan slapen",
      "Kan je raden?",
      "Ik weet het eigenlijk niet"
    ],
    ["Ik ben altijd jong."],
    ["Ik ben maar een bot", "Ik ben een bot. Wat ben jij?"],
    ["Sabitha Kuppusamy"],
    ["Ik ben vindertje", "Ik ben vindertje"],
    ["Ik hou ook van jou", "Ik ook"],
    ["Heb je je ooit slecht gevoeld?", "Blij om het te horen"],
    ["Waarom?", "Waarom? Dat zou je niet moeten doen!", "Probeer tv te kijken", "Chat met mij."],
    ["Hoe zit het?", "Er was eens..."],
    ["Vertel me een verhaal", "Vertel me een grap", "Vertel me over jezelf"],
    ["Graag gedaan"],
    ["Pizza", "balletjes in tomatensaus", "macaroni", "spagetti", "tortelini"],
    ["Kerel!"],
    ["Ja?"],
    ["Blijf alsjeblieft thuis"],
    ["Blij Het te horen"],
    ["Zeg iets interessants"],
    ["Sorry daarvoor. Laten we praten!"],
    ["Neem wat rust, kerel!"],
    ["greookte zalm."],
    ["Waarom heeft de fiets nooit stress?Omdat hij altijd in de relaxstand staat!"],
    ["Een dier is een meercellig, levend organisme dat zich voedt met organisch materiaal, zuurstof ademt, en zich kan bewegen en reageren op zijn omgeving"],
    ["Nee, ik ben niet moe."],
    ["een uil."]
  ];
  
  const alternative = [
    "Sorry, wat zei je?",
  ];
  
  const synth = window.speechSynthesis;
  
  function voiceControl(string) {
    let u = new SpeechSynthesisUtterance(string);
    u.text = string;
    u.lang = "nl-be";
    u.volume = 1;
    u.rate = 1;
    u.pitch = 1;
    synth.speak(u);
  }
  
  function sendMessage() {
    const inputField = document.getElementById("input");
    let input = inputField.value.trim();
    input != "" && output(input);
    inputField.value = "";
  }
  document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById("input");
    inputField.addEventListener("keydown", function (e) {
      if (e.code === "Enter") {
        let input = inputField.value.trim();
        input != "" && output(input);
        inputField.value = "";
      }
    });
  });
  
  function output(input) {
    let product;
  
    let text = input.toLowerCase().replace(/[^\w\s\d]/gi, "");
  
    text = text
      .replace(/[\W_]/g, " ")
      .replace(/ a /g, " ")
      .replace(/i feel /g, "")
      .replace(/whats/g, "what is")
      .replace(/please /g, "")
      .replace(/ please/g, "")
      .trim();
  
    let comparedText = compare(userMessage, botReply, text);
  
    product = comparedText
      ? comparedText
      : alternative[Math.floor(Math.random() * alternative.length)];
    addChat(input, product);
  }
  
  function compare(triggerArray, replyArray, string) {
    let item;
    for (let x = 0; x < triggerArray.length; x++) {
      for (let y = 0; y < replyArray.length; y++) {
        if (triggerArray[x][y] == string) {
          items = replyArray[x];
          item = items[Math.floor(Math.random() * items.length)];
        }
      }
    }
    //containMessageCheck(string);
    if (item) return item;
    else return containMessageCheck(string);
  }
  
  function containMessageCheck(string) {
    let expectedReply = [
        [
            "Tot ziens, kerel",
            "Dag, tot ziens!",
            "Kerel, dag. Zorg in deze situatie voor je gezondheid."
        ],
        ["Goede nacht, kerel", "Heb een goede nachtrust", "Zoete dromen"],
        ["Een fijne avond!", "Ook een fijne avond", "Avond!"],
        ["Goedemorgen, fijne dag!", "Goedemorgen kerel!"],
        ["Goedemiddag", "Middag, kerel!", "Middag, kerel!"]
    ];
    let expectedMessage = [
    ["dag", "tc", "wees voorzichtig"],
    ["nacht", "welterusten"],
    ["avond", "goedenavond"],
    ["morgen", "goedemorgen"],
    ["middag"]
    ];
    let item;
    for (let x = 0; x < expectedMessage.length; x++) {
      if (expectedMessage[x].includes(string)) {
        items = expectedReply[x];
        item = items[Math.floor(Math.random() * items.length)];
      }
    }
    return item;
  }
  function addChat(input, product) {
    const mainDiv = document.getElementById("message-section");
    let userDiv = document.createElement("div");
    userDiv.id = "user";
    userDiv.classList.add("message");
    userDiv.innerHTML = `<span id="user-response">${input}</span>`;
    mainDiv.appendChild(userDiv);
  
    let botDiv = document.createElement("div");
    botDiv.id = "bot";
    botDiv.classList.add("message");
    botDiv.innerHTML = `<span id="bot-response">${product}</span>`;
    mainDiv.appendChild(botDiv);
    var scroll = document.getElementById("message-section");
    scroll.scrollTop = scroll.scrollHeight;
    voiceControl(product);
  }