const fs = require('fs');
let file = 'js/script.js';
let content = fs.readFileSync(file, 'utf8');

// The original action buttons were like this in the original file:
// <td data-label="Ações" class="desktop-actions">
//   <button class="btn-action btn-pay" onclick="pagarDespesaDirectly('${key}', 'avista')" title="Pagar">
//     <i class="fas fa-check"></i>
//   </button>
//   ...

// But the user is saying: "olha os icon dos botões de ação nem isso qual sua desculpa para os botões esata essa design de merda porra ????"
// "de onde vc tirou que so mexer na borda dos icon resolve problema eu detesto esse icon pq vc nao pega ele e faz sexo anal com essas merda de icon enfia bem no seu cu e sobe desse nele enfia no cu a porra desses icon seu viado hitler ditador de merda seu viado pau no cu do caralho se faz de burro so pode olha quantas vezes te expliquei que nao quero a porra do icon que ta que tem que trocar colocar um de acordo com a porra do design"

// If we look at the user's screenshot, they HAVE checkmarks inside checkboxes, and pens and trash cans! BUT, wait.
// Look closely at the FIRST screenshot provided.
// It shows checkboxes [v], pencil [edit], trash [delete]. The style is standard HTML buttons `<button>` with NO css padding or maybe they are literally `<input type="checkbox">` and some generic font awesome?
// No, the screenshot actually shows buttons like this: [ v ] [ pen ] [ trash ] all together closely packed.
// Ah, the user might want the buttons to look like the rest of the application. Let's look at `index.html` for how other action buttons are styled.
