import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ServicecsService } from '../services/servicecs.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // ---------------------- Aqui hacemos las inyecciones -----------------------------

  private formBuilder: FormBuilder = inject(FormBuilder);
  private ws: ServicecsService = inject(ServicecsService);

  //----------------------- Estos son nuestros formularios ----------------
  formulario: FormGroup = this.formBuilder.group({
    msg: new FormControl("")
  });

  formulario2: FormGroup = this.formBuilder.group({
    msg: new FormControl("")
  });

  room: FormGroup = this.formBuilder.group({
    roomN: new FormControl("")
  });

  event: FormGroup = this.formBuilder.group({
    eventN: new FormControl("")
  });

  title = 'prueba';

  activoRoom = false;
  activoEvent = false;

  lrooms: any[] = [];
  levents: any[] = [];

  ngOnInit() {
    this.ListenFormsChanges();
    this.ListenInfo();
  }

  ListenRoom() {
    const roomName = this.room.get('roomN')?.value;

    if (roomName) {
      this.ws.listen(roomName).subscribe((msg: string) => {
        if (msg) {
          console.log(msg);
          this.formulario.get('msg')?.patchValue(msg, { emitEvent: false });
        }
      });
    }
  }

  ListenEvent() {
    const eventName = this.event.get('eventN')?.value;

    if (eventName) {
      this.ws.listen(eventName).subscribe((msg: string) => {
        if (msg) {
          this.formulario2.get('msg')?.patchValue(msg, { emitEvent: false });
        }
      });
    }
  }

  ListenInfo() {
    this.ws.listen("InfoUpdate").subscribe((Details: any) => {
      this.lrooms = Details.Rooms || [];
      this.levents = Details.Events || [];
    });
  }

  ListenFormsChanges() {
    this.formulario.get('msg')?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.SendMessageToRoom();
    });

    this.formulario2.get('msg')?.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.SendMessageToEvent();
    });
  }

  SendMessageToRoom() {
    const roomName = this.room.get('roomN')?.value;
    if (roomName && roomName !== this.formulario.get('msg')?.value) {
      this.ws.EmitToRoom(roomName, this.formulario.get('msg')?.value);
    }
  }

  SendMessageToEvent() {
    const eventName = this.event.get('eventN')?.value;
    if (eventName && eventName !== this.formulario2.get('msg')?.value) {
      this.ws.EmitToEvent(eventName, this.formulario2.get('msg')?.value);
    }
  }

  //--------------------- Con estas funciones vamos estar uniendonos y escuchando los eventos --------------------------

  async StartRoom() {
    const roomName = this.room.get('roomN')?.value;

    if (roomName) {
      await this.ws.JoinRoom(roomName);
      this.ListenRoom();
      this.activoRoom = true;
      this.ListenInfo();
    } else {
      alert("La room debe tener un nombre");
    }
  }

  async LeftRoom() {
    const roomName = this.room.get('roomN')?.value;

    if (roomName) {
      this.activoRoom = false;
      await this.ws.LeaveRoom(roomName);
      this.room.patchValue({ roomN: "" });
      this.ListenInfo();
    }
  }

  async StartEvent() {
    const eventName = this.event.get('eventN')?.value;

    if (eventName) {
      await this.ws.JoinEvent(eventName);
      this.ListenEvent();
      this.activoEvent = true;
      this.ListenInfo();
    } else {
      alert("El evento debe tener un nombre");
    }
  }

  async LeftEvent() {
    const eventName = this.event.get('eventN')?.value;

    if (eventName) {
      this.activoEvent = false;
      await this.ws.LeaveEvent(eventName);
      this.event.patchValue({ eventN: "" });
      this.ListenInfo();
    }
  }

}
