var crud=(()=>{ 
  const KEY="crud-dados"
  let dados=JSON.parse(localStorage.getItem(KEY))||[]
  let idAtual=dados.length?Math.max(...dados.map(r=>r.id||0))+1:1
  let editId=null

  const modal=new bootstrap.Modal(document.getElementById("crudModal"))
  const form=document.getElementById("crud-form")
  const container=document.getElementById("form-container")
  const tpl=document.getElementById("form-template").content

  const render=()=>{ 
    const list=document.getElementById("crud-list")
    list.innerHTML=""
    dados.forEach(it=>{
      const tr=document.createElement("tr")
      const prin=it.descricao||it.codigoprod||""
      tr.innerHTML=`<td>${it.id}</td><td>${prin}</td><td>
      <button class="btn btn-sm btn-warning me-1" onclick="crud.edit(${it.id})">Editar</button>
      <button class="btn btn-sm btn-danger" onclick="crud.remove(${it.id})">Excluir</button></td>`
      list.appendChild(tr)
    })
  }

  const save=()=>{ 
    const obj=Object.fromEntries(new FormData(form).entries())
    if(editId!=null){
      const i=dados.findIndex(r=>r.id===editId)
      dados[i]={id:editId,...obj}
    }else{
      dados.push({id:idAtual++,...obj})
    }
    localStorage.setItem(KEY,JSON.stringify(dados))
    modal.hide()
    form.reset()
    editId=null
    render()
  }

  const calcFrete=()=>{ 
    const p=v=>parseFloat(String(v).replace(',','.'))||NaN
    const peso=p(form.elements["pesopac"]?.value)
    const larg=p(form.elements["larg"]?.value)
    const alt=p(form.elements["altura"]?.value)
    const prof=p(form.elements["profundidade"]?.value)
    if([peso,larg,alt,prof].some(x=>isNaN(x))){alert("Preencha peso e dimensões válidas.");return}
    let v
    if(peso<=0.30)v=8
    else if(peso<=1.0&&(larg<50||alt<50||prof<50))v=15
    else v=30
    alert("Frete: R$ "+v.toFixed(2))
  }

  const showForm=(it=null)=>{ 
    container.innerHTML=""
    const c=tpl.cloneNode(true)
    container.appendChild(c)
    if(it){Object.entries(it).forEach(([k,v])=>{const inp=form.elements.namedItem(k);if(inp)inp.value=v})}
    const btn=form.querySelector("#calcFreteBtn")
    if(btn)btn.onclick=()=>calcFrete()
    modal.show()
  }

  const edit=id=>{const it=dados.find(r=>r.id===id);if(!it)return;editId=id;showForm(it)}
  const remove=id=>{const it=dados.find(r=>r.id===id);if(!it)return
    if(confirm(`Excluir "${it.descricao||it.codigoprod}" (ID ${it.id})?`)){
      dados=dados.filter(r=>r.id!==id)
      localStorage.setItem(KEY,JSON.stringify(dados))
      render()
    }
  }
  const download=()=>{const b=new Blob([JSON.stringify(dados,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="dados.json";a.click();URL.revokeObjectURL(a.href)}

  form.addEventListener("submit",e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}save()})
  render()
  return{showForm,edit,remove,download}
})()
