import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';

import { UserService } from 'src/app/core/auth/services/user.service';
import { LightService } from '../../services/light.service';
import { Experiment } from '../../interfaces/experiment';

@Component({
  selector: 'app-experiments',
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.css']
})
export class ExperimentsComponent implements OnInit {
  tableTitle: string = "Experiments";
  isLoading: boolean = false;
  userId!: number;
  selectedExperiment?: Experiment;
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<Experiment>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private lightService: LightService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.userService.getUserData().subscribe((user) => {
      this.userId = user.id!;
      this.getExperiments(this.userId);
    });
  }

  getExperiments(owner: number): void {
    this.lightService.getExperiments(owner).subscribe((response) => {
      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Set the initial sort configuration
      this.sort.active = 'id';
      this.sort.direction = 'asc';
      this.sort.sortChange.emit({ active: 'id', direction: 'asc' });
    });
  }
}
