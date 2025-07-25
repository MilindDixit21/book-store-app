import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form ={
     username: '',
    email: '',
    password: '',
     role: 'viewer' as 'viewer'|'editor'|'admin'
  };
  

  constructor(private auth:AuthService, private router:Router){}

  submit(){
    this.auth.register(this.form).subscribe({
      next:(res:any) =>{
        localStorage.setItem('auth_token', res.token);
        alert('registered successfully');
        this.router.navigate(['/login']);
      },
      error:()=>alert('Registration failed')
    });
  }
}
