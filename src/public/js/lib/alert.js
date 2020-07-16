class Alert{
    constructor(config){
      
      let defaultConfig = {
        time:5000
      }
      
      this.config = {
        ...defaultConfig,
        ...config
      };
      document.body.append(
        new DOMParser().parseFromString(`<div class="alert-container"></div>`, 'text/html').body.firstChild
      );
    }
    
    createDom(text){
      let dom = new DOMParser().parseFromString(`
        <div class="alert">
          <div class="alert__close"><i class="fas fa-times"></i></div>
          <div class="alert__icon"></div>
          <div class="alert__title">Titulo de Alerta</div>
          <div class="alert__body">
            <p>${text}</p>
          </div>
        </div>`, 'text/html').body.firstChild;
        let idsetTimeout = setTimeout(()=>dom.querySelector('.alert__close').click(),this.config.time)
        dom.querySelector('.alert__close').addEventListener('click',this.close.bind(this));
        dom.querySelector('.alert__close').addEventListener('click',()=>{ clearTimeout(idsetTimeout)});
        
        return dom
    }
    
    isObject (value) {
      return value && typeof value === 'object' && value.constructor === Object;
    }
    
    success(text,...params){
      
      let json =  this.isObject(text) ? text : false;
      
      let alert = this.createDom(text);
      alert.classList.add('alert-success');
      alert.querySelector('.alert__body').innerHTML = json ? json.text : text;
      alert.querySelector('.alert__icon').innerHTML = '<i class="fas fa-check-circle"></i>';
      if(json || params[0]){
         alert.querySelector('.alert__title').innerHTML = json ? json.title : params[0];
      }
      
      document.querySelector('.alert-container').appendChild(alert);
      
    }
    
    error(text,...params){
      let alert = this.createDom(text);
      alert.classList.add('alert-error');
      alert.querySelector('.alert__body').innerHTML = text;
      alert.querySelector('.alert__icon').innerHTML = '<i class="fas fa-exclamation-circle"></i>';
      if(params[0]){
         alert.querySelector('.alert__title').innerHTML = params[0];
      }
      
      document.querySelector('.alert-container').appendChild(alert);
      
    }
    
    show(text,...params){
      let json =  this.isObject(text) ? text : false;
      
      let alert = this.createDom(text);
      alert.querySelector('.alert__body').innerHTML = json ? json.text : text;
      if(json && json.icon){
        alert.classList.add('alert-icon-custom');
        alert.querySelector('.alert__icon').innerHTML = '<i class="'+json.icon+'"></i>';    
      }
      
      if(json || params[0]){
         alert.querySelector('.alert__title').innerHTML = json ? json.title : params[0];
      }
      
      if(json && json.color) alert.style.setProperty('--color', json.color);
      
      document.querySelector('.alert-container').appendChild(alert);
      
    }
    
    close(ev){
      document.querySelector('.alert-container').removeChild(ev.target.parentNode);
    }
    
}
  
const alert = new Alert({
    time:5000
});

/*
 alert.show({
    title:'Titulo custom con color',
    text:'Texto custom',
    icon:'fas fa-bell',
    color:'gray'
  })
*/