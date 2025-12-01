// Application État
const app = {
    currentUser: null,
    cards: [],
    currentCard: null,
    isCardFlipped: false,
  }
  
  // Éléments DOM
  const loginScreen = document.getElementById("loginScreen")
  const mainScreen = document.getElementById("mainScreen")
  const loginForm = document.getElementById("loginForm")
  const logoutBtn = document.getElementById("logoutBtn")
  const navFormBtn = document.getElementById("navFormBtn")
  const navDashboardBtn = document.getElementById("navDashboardBtn")
  const cardForm = document.getElementById("cardForm")
  const formSection = document.getElementById("formSection")
  const dashboardSection = document.getElementById("dashboardSection")
  const cardFlipContainer = document.getElementById("cardFlipContainer")
  const flipCardBtn = document.getElementById("flipCardBtn")
  const saveCardBtn = document.getElementById("saveCardBtn")
  const downloadCardBtn = document.getElementById("downloadCardBtn")
  const cardsList = document.getElementById("cardsList")
  
  // Initialisation
  document.addEventListener("DOMContentLoaded", () => {
    loadCardsFromStorage()
    setupEventListeners()
  })
  
  function setupEventListeners() {
    // Login
    loginForm.addEventListener("submit", handleLogin)
    logoutBtn.addEventListener("click", handleLogout)
  
    // Navigation
    navFormBtn.addEventListener("click", () => switchSection("form"))
    navDashboardBtn.addEventListener("click", () => switchSection("dashboard"))
  
    // Formulaire
    cardForm.addEventListener("submit", handleFormSubmit)
  
    // Carte
    flipCardBtn.addEventListener("click", toggleCardFlip)
    saveCardBtn.addEventListener("click", saveCard)
    downloadCardBtn.addEventListener("click", downloadCard)
  
    // Photo
    document.getElementById("photo").addEventListener("change", handlePhotoUpload)
  }
  
  // AUTHENTIFICATION
  function handleLogin(e) {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
  
    if (username && password) {
      app.currentUser = { username, role: "admin" }
      loginScreen.classList.remove("active")
      mainScreen.classList.add("active")
      loginForm.reset()
    }
  }
  
  function handleLogout() {
    app.currentUser = null
    mainScreen.classList.remove("active")
    loginScreen.classList.add("active")
    loginForm.reset()
  }
  
  // NAVIGATION
  function switchSection(section) {
    formSection.classList.remove("active")
    dashboardSection.classList.remove("active")
    navFormBtn.classList.remove("active")
    navDashboardBtn.classList.remove("active")
  
    if (section === "form") {
      formSection.classList.add("active")
      navFormBtn.classList.add("active")
      app.isCardFlipped = false
      cardFlipContainer.classList.remove("flipped")
    } else {
      dashboardSection.classList.add("active")
      navDashboardBtn.classList.add("active")
      displayCards()
    }
  }
  
  // FORMULAIRE
  function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        document.getElementById("previewPhoto").src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  
  function handleFormSubmit(e) {
    e.preventDefault()
  
    const cardData = {
      id: Date.now(),
      matricule: document.getElementById("matricule").value,
      nom: document.getElementById("nom").value,
      dob: document.getElementById("dob").value,
      cycle: document.getElementById("cycle").value,
      niveau: document.getElementById("niveau").value,
      photo: document.getElementById("previewPhoto").src,
    }
  
    app.currentCard = cardData
    updateCardPreview(cardData)
    generateQRCode(cardData)
    downloadCardBtn.style.display = "block"
  }
  
  function updateCardPreview(cardData) {
    document.getElementById("previewMatricule").textContent = cardData.matricule
    document.getElementById("previewNom").textContent = cardData.nom
    document.getElementById("previewDob").textContent = formatDate(cardData.dob)
    document.getElementById("previewCycle").textContent = cardData.cycle
    document.getElementById("previewNiveau").textContent = cardData.niveau
  
    if (cardData.photo) {
      document.getElementById("previewPhoto").src = cardData.photo
    }
  }
  
  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }
  
  // Import QRCode library
  const QRCode = window.QRCode
  
  function generateQRCode(cardData) {
    const qrContainer = document.getElementById("qrcode")
    qrContainer.innerHTML = ""
  
    const qrData = `Matricule: ${cardData.matricule}\nNom: ${cardData.nom}\nDOB: ${cardData.dob}\nCycle: ${cardData.cycle}\nNiveau: ${cardData.niveau}`
  
    new QRCode(qrContainer, {
      text: qrData,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    })
  }
  
  // FLIP CARTE
  function toggleCardFlip() {
    const cardFlip = cardFlipContainer.querySelector(".card-flip")
    cardFlip.classList.toggle("flipped")
    app.isCardFlipped = cardFlip.classList.contains("flipped")
    flipCardBtn.textContent = app.isCardFlipped ? "Voir l'Avant / Front" : "Retourner la Carte / Flip Card"
  }
  
  // ENREGISTRER CARTE
  function saveCard() {
    if (!app.currentCard) {
      alert("Veuillez d'abord créer une carte")
      return
    }
  
    const existingIndex = app.cards.findIndex((c) => c.id === app.currentCard.id)
    if (existingIndex >= 0) {
      app.cards[existingIndex] = app.currentCard
    } else {
      app.cards.push(app.currentCard)
    }
  
    saveCardsToStorage()
    alert("Carte enregistrée avec succès!")
    cardForm.reset()
    document.getElementById("previewPhoto").src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3C/svg%3E'
    downloadCardBtn.style.display = "none"
  }
  
  // Import html2canvas library
  const html2canvas = window.html2canvas
  
  // TÉLÉCHARGER CARTE
  async function downloadCard() {
    if (!app.currentCard) {
      alert("Aucune carte à télécharger")
      return
    }
  
    try {
      const canvas = await html2canvas(cardFlipContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })
  
      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `carte_${app.currentCard.matricule}.png`
      link.click()
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      alert("Erreur lors du téléchargement de la carte")
    }
  }
  
  // TABLEAU DE BORD
  function displayCards() {
    if (app.cards.length === 0) {
      cardsList.innerHTML = '<p class="empty-message">Aucune carte créée yet / No cards created</p>'
      return
    }
  
    cardsList.innerHTML = app.cards
      .map(
        (card) => `
          <div class="card-item">
              <div class="card-item-preview">
                  <div class="card-item-info">
                      <div style="font-weight: bold; color: #333;">${card.nom}</div>
                      <div style="font-size: 11px; color: #666;">${card.matricule}</div>
                  </div>
                  <img src="${card.photo}" alt="Photo" class="card-item-photo">
              </div>
              <div class="card-item-details">
                  <div class="card-item-meta">Niveau: ${card.niveau} | Cycle: ${card.cycle.split("-")[0]}</div>
                  <div class="card-item-actions">
                      <button class="btn btn-secondary" onclick="loadCardToEdit(${card.id})">Modifier</button>
                      <button class="btn btn-secondary" onclick="deleteCard(${card.id})">Supprimer</button>
                  </div>
              </div>
          </div>
      `,
      )
      .join("")
  }
  
  function loadCardToEdit(cardId) {
    const card = app.cards.find((c) => c.id === cardId)
    if (card) {
      document.getElementById("matricule").value = card.matricule
      document.getElementById("nom").value = card.nom
      document.getElementById("dob").value = card.dob
      document.getElementById("cycle").value = card.cycle
      document.getElementById("niveau").value = card.niveau
      document.getElementById("previewPhoto").src = card.photo
  
      app.currentCard = card
      updateCardPreview(card)
      generateQRCode(card)
      downloadCardBtn.style.display = "block"
  
      switchSection("form")
    }
  }
  
  function deleteCard(cardId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette carte?")) {
      app.cards = app.cards.filter((c) => c.id !== cardId)
      saveCardsToStorage()
      displayCards()
    }
  }
  
  // STOCKAGE LOCAL
  function saveCardsToStorage() {
    localStorage.setItem("studentCards", JSON.stringify(app.cards))
  }
  
  function loadCardsFromStorage() {
    const stored = localStorage.getItem("studentCards")
    if (stored) {
      app.cards = JSON.parse(stored)
    }
  }
  
  