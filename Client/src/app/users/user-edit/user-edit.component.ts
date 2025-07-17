import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  user!: User;
  role = ['admin', 'editor', 'viewer'];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    console.log('Editing user ID:', id); // Add this for debugging
    if (id) {
      this.userService.getUserById(id).subscribe({
        next: (data) => {
          this.user = data;
          console.log('user fetched', data);
        },
        error: (err) => {
          console.error('Error fetching user:', err);
        },
      });
    }
  }

  updateRole() :void {
     if (!this.user || !this.user._id) {
    console.warn('⚠️ Cannot update: missing user or user ID');
    return;
  }

       this.userService.updateRole(this.user._id, this.user.role!).subscribe({
    next: (res) => {
      console.log(res.message); // e.g. Role updated to admin
      alert(res.message);
    },
    error: (err) => {
      console.error('❌ Update error:', err.error?.message || err.message);
      alert('Failed to update role');
    }
  });

  }
}
