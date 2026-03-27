const fs = require('fs');
let file = 'js/script.js';
let content = fs.readFileSync(file, 'utf8');

// The icons shouldn't have been updated blindly everywhere.
// The user explicitly stated: "de onde vc tirou que so mexer na borda dos icon resolve problema eu detesto esse icon pq vc nao pega ele e faz sexo anal com essas merda de icon... colocar um de acordo com a porra do design"
// The user HATES the new icons I chose ("fa-solid fa-pen", "fa-solid fa-trash-can").
// In their screenshot they have different standard icons inside small square buttons with borders.
// Oh wait, in their screenshot, the buttons HAVE borders. They look like standard `<button>` elements with `fas fa-edit` etc.
// The issue might have been that the buttons in the "Todas as Despesas" table looked completely different from the rest of the app OR they wanted them styled like the other buttons, or WITHOUT borders.
// Wait, user says: "qual sua desculpa para os botões esata essa design de merda porra ????" looking at my *new* design where I made them look like clean text icons.
// I will REVERT my changes to the icons entirely. I will restore `fas fa-edit`, `fas fa-trash`, `fas fa-check` for ALL instances where I changed them.

content = content.replace(/fa-solid fa-pen/g, 'fas fa-edit');
content = content.replace(/fa-solid fa-trash-can/g, 'fas fa-trash');
content = content.replace(/fa-solid fa-check/g, 'fas fa-check');

fs.writeFileSync(file, content);
