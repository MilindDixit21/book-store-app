import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

   credentials = {
    email: '',
    password: ''
  };

   constructor(private auth: AuthService, private router:Router) {}

  submit() {
    this.auth.login(this.credentials).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        // alert('Login successful');
        this.router.navigate(['/books']);
      },
      error: () => alert('Login failed')
    });
  }


}
