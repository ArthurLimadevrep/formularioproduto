var crud = (() => {
  const STORAGE_KEY = "crud-dados"
  let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  let idAtual = dados.length ? Math.max(...dados.map(r => r.id)) + 1 : 1
  let editandoId = null

  const modal = new bootstrap.Modal(document.getElementById("crudModal"))
  const form = document.getElementById("crud-form")
  const container = document.getElementById("form-container")
  const template = document.getElementById("form-template").content

  const render = () => {
    const list = document.getElementById("crud-list")
    list.innerHTML = ""
    dados.forEach(item => {
      const tr = document.createElement("tr")
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.descricao || item.codigoprod || ""}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="crud.edit(${item.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="crud.remove(${item.id})">Excluir</button>
        </td>
      `
      list.appendChild(tr)
    })
  }

  const save = () => {
    const obj = Object.fromEntries(new FormData(form).entries())
    if (editandoId) {
      const i = dados.findIndex(r => r.id === editandoId)
      dados[i] = { id: editandoId, ...obj }
    } else {
      dados.push({ id: idAtual++, ...obj })
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
    modal.hide()
    editandoId = null
    render()
  }

  const calcFrete = () => {
    const toNum = v => parseFloat(String(v).replace(",", "."))
    const peso = toNum(form.elements["pesopac"]?.value)
    const largura = toNum(form.elements["larg"]?.value)
    const altura = toNum(form.elements["altura"]?.value)
    const prof = toNum(form.elements["profundidade"]?.value)

    if ([peso, largura, altura, prof].some(isNaN)) {
      alert("Preencha peso e dimensões válidas.")
      return
    }

    let valor = 30
    if (peso <= 0.30) valor = 8
    else if (peso <= 1 && (largura < 50 || altura < 50 || prof < 50)) valor = 15

    alert("Frete: R$ " + valor.toFixed(2))
  }

  const showForm = (item = null) => {
    container.innerHTML = ""
    container.appendChild(template.cloneNode(true))
    if (item) {
      Object.entries(item).forEach(([k, v]) => {
        if (form.elements[k]) form.elements[k].value = v
      })
    }
    form.querySelector("#calcFreteBtn").onclick = calcFrete
    modal.show()
  }

  const edit = id => {
    const item = dados.find(r => r.id === id)
    if (!item) return
    editandoId = id
    showForm(item)
  }

  const remove = id => {
    const item = dados.find(r => r.id === id)
    if (!item) return
    if (confirm(`Excluir "${item.descricao || item.codigoprod}" (ID ${item.id})?`)) {
      dados = dados.filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
      render()
    }
  }

  const download = () => {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "dados.json"
    a.click()
  }

  form.addEventListener("submit", e => {
    e.preventDefault()
    save()
  })

  render()
  return { showForm, edit, remove, download }
})()
