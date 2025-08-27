const crud = (() => {
    const STORAGE_KEY = "crud-dados";
    let dados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let idAtual = dados.length ? Math.max(...dados.map(r => r.id)) + 1 : 1;
    let editandoId = null;
  
    const modal = new bootstrap.Modal(document.getElementById("crudModal"));
    const form = document.getElementById("crud-form");
    const zipCodeMask = (value) => {
      if (!value) return "";
      value = value.replace(/\D/g, '');
      value = value.substring(0, 8);
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      return value;
    };
    form.addEventListener("input", function (e) {
      if (e.target && e.target.id === "cpf") {
        let value = e.target.value;
        let cpfPattern = value.replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1');
        e.target.value = cpfPattern;
      }
      if (e.target && e.target.id === "cep") {
    let cursorPosition = e.target.selectionStart;
    let originalLength = e.target.value.length;
  
    e.target.value = zipCodeMask(e.target.value);
  
    let newLength = e.target.value.length;
    cursorPosition = cursorPosition + (newLength - originalLength);
    e.target.setSelectionRange(cursorPosition, cursorPosition);
  }
  });
    const container = document.getElementById("form-container");
    const templateContent = document.getElementById("form-template").content;
  
    const render = () => {
      const list = document.getElementById("crud-list");
      list.innerHTML = "";
  
      dados.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.id}</td>
          <td>${item[Object.keys(item)[1]]}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="crud.edit(${item.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="crud.remove(${item.id})">Excluir</button>
          </td>
        `;
        list.appendChild(tr);
      });
    };
  
    const save = () => {
      const formData = new FormData(form);
      const obj = Object.fromEntries(formData.entries());
  
      if (editandoId != null) {
        const index = dados.findIndex(r => r.id === editandoId);
        dados[index] = { id: editandoId, ...obj };
      } else {
        dados.push({ id: idAtual++, ...obj });
      }
  
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
      modal.hide();
      form.reset();
      editandoId = null;
      render();
    };
  
    const showForm = (item = null) => {
      container.innerHTML = "";
      const clone = templateContent.cloneNode(true);
      container.appendChild(clone);
  
      
      if (item) {
        Object.entries(item).forEach(([key, value]) => {
          const input = form.elements.namedItem(key);
          if (input) input.value = value;
        });
      }
  
      modal.show();
    };
  
    const edit = (id) => {
      const item = dados.find(r => r.id === id);
      editandoId = id;
      showForm(item);
    };
  
    const remove = (id) => {
      const item = dados.find(r => r.id === id);
      if (confirm(`Tem certeza que deseja excluir o item "${item[Object.keys(item)[1]]}" (ID ${item.id})?`)) {
        dados = dados.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        render();
      }
    };
  
    const download = () => {
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dados.json";
      a.click();
    };
  
    form.addEventListener("submit", e => {
      e.preventDefault();
      save();
    });
  
    render();
  
    return { showForm, edit, remove, download };
  })();