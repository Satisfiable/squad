fetch("/irregularPattern")
  .then((response) => response.json())
  .then((patterns) => {
    let container = document.querySelector(".container");

    let patternObject = patterns[0]; // Get the first object

    let patternKeys = Object.keys(patternObject).filter((key) =>
      key.startsWith("pattern")
    ); // ✅ Only keep keys that start with 'pattern'

    for (let i = 0; i < patternKeys.length; i++) {
      let key = patternKeys[i]; // e.g., "pattern1"
      let patternArray = patternObject[key]; // the verbs array

      let htmlPseudo = `<h3 class="pattern-name">Pattern ${key.slice(-1)}</h3>`; // Optional heading

      for (let x = 0; x < patternArray.length; x++) {
        htmlPseudo += `<div class="word"><div class="item-def"><h3>${patternArray[x].definitionTR}</h3></div>
                          <div class="word-formlist">
                            <div class="word-form">${patternArray[x].v1}</div>
                            <div class="word-form">${patternArray[x].v2}</div>
                            <div class="word-form">${patternArray[x].v3}</div>
                          </div>
                        </div>  `;
      }

      let html = `<div class="pattern">${htmlPseudo}</div>`;
      container.innerHTML += html;
    }
  });
