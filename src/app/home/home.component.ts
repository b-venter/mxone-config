import { Component, ViewChild, OnInit, inject } from '@angular/core';

import { FormControl, FormsModule, FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from "@angular/forms"

import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { config } from 'rxjs';

interface qosElement {
  id: string;
  label: string;
}

interface platformElement {
  id: string;
  comment: string;
}

let networkSubnetMap4 = new Map();
let networkSubnetMap4SO = new Map();
let networkSubnetMap6 = new Map();
let networkSubnetMap6SO = new Map();

type networkArray = {
  id: number;
  net: string;
}

type ip4 = [
  number, //1
  number, //2
  number, //3
  number  //4
];

type ip6 = [
  number, //1
  number, //2
  number, //3
  number, //4
  number, //5
  number, //6
  number, //7
  number, //8
  number, //9
  number, //10
  number, //11
  number, //12
  number, //13
  number, //14
  number, //15
  number  //16
];

@Component({
  selector: 'app-home',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true},
    },
  ],
  imports: [
    MatGridListModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatStepperModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    TextFieldModule,
    FormsModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('stepperOnly') stepperOnly!: MatStepper;

  version = "0.0.6"

  ipv6_test = false
  ipv6_true_text = "This site uses IPv6"
  ipv6_false_text = "This site does not use IPv6"
  output = ""
  outputSO = ""
  stepper_duration = "1000" //Animation timer
  stepper_linear = true; //Force stepper to progress in sequence. Set to false if want stepper errors displayed
  download_ready = false;
  downloadSO_ready = false;

  base_dirty = false
  so_dirty = false

  un = '\n' //UNIX new line

  serverArray = [
    {label: "1"}
  ]

  serverOnlyArray = [
    {label: "1"}
  ]

  datacenterArray = [
    {id: "1"}
  ]

  networkArray = [
    {id: "1"}
  ]
  
  
  
  def_qos_media = "0xB8"
  def_qos_sig = "0x98"
  def_mrkt_data = "standard"
  def_lic_type = "featureBased"
  def_platform = "virtual"

  banner: string = 
`# ==========================================================================
# This is an open source UNOFFICIAL tool to assist with the creation of
# Mitel MiVoice MXONE InstallData and ServerData files.
#
# Source code on Github: https://github.com/b-venter/mxone-config
#
# ==========================================================================`

  qos: qosElement[] = [
    {id: "0x00", label: "Best_Effort"},
    {id: "0x20", label: "CS1"},         
    {id: "0x28", label: "AF11"},         
    {id: "0x30", label: "AF12"},         
    {id: "0x38", label: "AF13"},         
    {id: "0x40", label: "CS2"},         
    {id: "0x48", label: "AF21"},         
    {id: "0x50", label: "AF22"},         
    {id: "0x58", label: "AF23"},         
    {id: "0x60", label: "CS3"},         
    {id: "0x68", label: "AF31"},         
    {id: "0x70", label: "AF32"},         
    {id: "0x78", label: "AF33"},         
    {id: "0x80", label: "CS4"},         
    {id: "0x88", label: "AF41"},         
    {id: "0x90", label: "AF42"},         
    {id: "0x98", label: "AF43"},         
    {id: "0xA0", label: "CS5"},         
    {id: "0xB8", label: "EF"},         
    {id: "0xC0", label: "CS6"},         
    {id: "0xE0", label: "CS7"},         
  ]

  licenses: string[] = [
    "traditional",
    "featureBased",
    "subscriptionBased"
  ]

  market: string[] = [
    "australia",
    "austria",
    "belgium",
    "brazil",
    "canada",
    "china",
    "denmark",
    "finland",
    "france",
    "germany",
    "hong_kong_a_law",
    "hong_kong_my_law",
    "india",
    "indonesia",
    "ireland",
    "italy",
    "korea",
    "malaysia",
    "market_group_2",
    "mexico","new_zealand",
    "north_america",
    "norway",
    "saudi_arabia",
    "singapore",
    "south_africa",
    "spain",
    "standard",
    "sweden",
    "switzerland",
    "the_netherlands",
    "united_kingdom"
  ]

  platform: platformElement[] = [
    {id: "bareMetal", comment: "Running on HW without virtualization. For instance: ASU or Dell"},
    {id: "virtual", comment: "For instance: vmware, hyperv or kvm"},
    {id: "Azure", comment: "Cloud environment"},
    {id: "AWS", comment: "Cloud environment"}
  ]

  serverSet: FormGroup;
  baseSet: FormGroup;
  networkSet: FormGroup;
  datacenterSet: FormGroup;
  baseSetServerOnly: FormGroup;
  serverSetServerOnly: FormGroup;

  constructor(private ds: FormBuilder){
    this.baseSet = this.ds.group({
      system_name: [""],
      version: ["0.2"],
      mxone_domain: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9.-]*')]], //
      ntp: ["", Validators.required],
      qos_media: [this.def_qos_media, Validators.required],
      qos_sig: [this.def_qos_sig, Validators.required],
      mrkt_data: [this.def_mrkt_data, Validators.required],
      lic_type: [this.def_lic_type, Validators.required],
      dns_srv1: [""],
      dns_srv2: [""],
      dns_srv3: [""],
      dsn_srch1: [""],
      dsn_srch2: [""],
      dsn_srch3: [""],
      dsn_srch4: [""],
      dsn_srch5: [""],
    }),
    this.networkSet = this.ds.group({
      networks: this.ds.array([]),
    }),
    this.datacenterSet = this.ds.group({
      dc_racks: this.ds.array([]),
    }),
    this.serverSet = this.ds.group({
      fields: this.ds.array([]), //Storage of dynamically created fields
    }),
    this.baseSetServerOnly = this.ds.group({
      system_name: [""],
      version: ["0.2"],
    }),
    this.serverSetServerOnly = this.ds.group({
      fields: this.ds.array([]), //Storage of dynamically created fields
    })
  }

  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.addLim1();
    this.addDC1();
    this.addNet1();
    this.addServerOnly(false);
  }

  get fieldsArray(): FormArray {
    return this.serverSet.get('fields') as FormArray;
  }

  get fieldsSOArray(): FormArray {
    return this.serverSetServerOnly.get('fields') as FormArray;
  }

  get dcrArray(): FormArray {
    return this.datacenterSet.get('dc_racks') as FormArray;
  }

  get netwArray(): FormArray {
    return this.networkSet.get('networks') as FormArray;
  }

  

  addLim1() {
    const serverGroup = this.ds.group({
      host_name: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9-]*'), Validators.maxLength(63)]],
      ipv4: ["", Validators.required],
      ipv6: [""],
      dc: ["", Validators.required],
      rack: ["", Validators.required],
      platform: [this.def_platform, Validators.required],
      lim: [{value: true, disabled: true}], //NOTE: need to enable before submitting, else values are ignored/not present
      limno: [{value: 1, disabled: false}],
      mediasrv: [false],
      cass: [false],
      cassip: [""]
    });
    this.fieldsArray.push(serverGroup)
  }

  addDC1() {
    const dc = this.ds.group({
      datacenter: ["MainDC", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9_-]*'), Validators.maxLength(48), Validators.minLength(2)]],
      rack1: ["RackA", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9_-]*'), Validators.maxLength(48), Validators.minLength(2)]],
      rack2: ["RackB", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9_-]*'), Validators.maxLength(48), Validators.minLength(2)]]
    });
    this.dcrArray.push(dc) 
  }

  addNet1() {
    const net = this.ds.group({
      network: ["192.168.0.0", Validators.required],
      subnet: ["24", Validators.required],
      gateway: ["192.168.0.1", Validators.required],
      type: ["ipv4", Validators.required]
    });
    this.netwArray.push(net) 
  }

  addServer() {  
    const newServerLabel = `${this.serverArray.length + 1}`
    this.serverArray.push({ label: newServerLabel });
    this.serverArray = [...this.serverArray]
    
    const serverGroup = this.ds.group({
      host_name: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9-]*'), Validators.maxLength(63)]],
      ipv4: ["", Validators.required],
      ipv6: [""],
      dc: ["", Validators.required], 
      rack: ["", Validators.required], 
      platform: [this.def_platform, Validators.required],
      lim: [false],
      limno: [{value: 0, disabled: false}],
      mediasrv: [false],
      cass: [false],
      cassip: [""]
    });
    this.fieldsArray.push(serverGroup)
    this.serverSet.markAsDirty();
    this.openSnackBar("Server added", "Close");
  }

  addDC() {
    const newDC = `${this.datacenterArray.length + 1}`
    this.datacenterArray.push({ id: newDC });
    this.datacenterArray = [...this.datacenterArray]

    const dc = this.ds.group({
      datacenter: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9_-]*'), Validators.maxLength(48), Validators.minLength(2)]],
      rack1: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9_-]*'), Validators.maxLength(48), Validators.minLength(2)]],
      rack2: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9_-]*'), Validators.maxLength(48), Validators.minLength(2)]]
    });
    this.dcrArray.push(dc)
    this.datacenterSet.markAsDirty();
    this.harmonise_dirty();
    this.openSnackBar("Datacenter added", "Close");
  }

  addNet() {
    const newNet = `${this.networkArray.length + 1}`
    this.networkArray.push({ id: newNet });
    this.networkArray = [...this.networkArray]

    const net = this.ds.group({
      network: ["", Validators.required],
      subnet: ["", Validators.required],
      gateway: ["", Validators.required],
      type: ["", Validators.required]
    });
    this.netwArray.push(net) 
    this.networkSet.markAsDirty();
    this.harmonise_dirty();
    this.openSnackBar("Network added", "Close");
  }

  rmServer(l :number) {  
    this.serverArray.splice(l, l);
    this.serverArray = [...this.serverArray]
    this.fieldsArray.removeAt(l)
    networkSubnetMap4.delete(l);
    networkSubnetMap6.delete(l);
    this.serverSet.markAsDirty();
    this.openSnackBar("Server removed", "Close");
  }

  rmDC(l :number) {
    //TODO: block removal if DC in use
    this.datacenterArray.splice(l, l);
    this.datacenterArray = [...this.datacenterArray]
    this.dcrArray.removeAt(l)
    this.datacenterSet.markAsDirty();
    this.harmonise_dirty();
    this.openSnackBar("Datacenter removed", "Close");
  }

  rmNet(l :number) {
    //TODO: block removal if DC in use
    this.networkArray.splice(l, l);
    this.networkArray = [...this.networkArray]
    this.netwArray.removeAt(l) 
    this.networkSet.markAsDirty();
    this.harmonise_dirty();
    this.openSnackBar("Network removed", "Close");
  }

  addServerOnly(x :boolean) {  

    if (x) {
      const newServerLabel = `${this.serverOnlyArray.length + 1}`
    this.serverOnlyArray.push({ label: newServerLabel });
    this.serverOnlyArray = [...this.serverOnlyArray]
    }

    const serverGroup = this.ds.group({
      host_name: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9][a-zA-Z0-9-]*'), Validators.maxLength(63)]],
      ipv4: ["", Validators.required],
      ipv6: [""],
      dc: ["", Validators.required], //TODO: add in general, then make available as a list to reduce typos
      rack: ["", Validators.required], //TODO: add in general, then make available as a list to reduce typos and force only 2
      platform: [this.def_platform, Validators.required],
    });
    this.fieldsSOArray.push(serverGroup)
    
    if (x) {
      this.openSnackBar("Server added", "Close");
    }
  }

  rmServerOnly(l :number) {  
    this.serverOnlyArray.splice(l, l);
    this.serverOnlyArray = [...this.serverOnlyArray]
    this.fieldsSOArray.removeAt(l)
    networkSubnetMap4SO.delete(l);
    networkSubnetMap6SO.delete(l);
    this.serverSetServerOnly.markAsDirty();
    this.harmonise_dirty();
    this.openSnackBar("Server removed", "Close");
  }

  checkDirty() :boolean {
    if (this.baseSet.dirty || this.serverSet.dirty || this.networkSet.dirty || this.datacenterSet.dirty || this.base_dirty) {
      return true
    } else {
      return false
    }
  }

  checkDirtySO() :boolean {
    if (this.baseSetServerOnly.dirty || this.serverSetServerOnly.dirty || this.networkSet.dirty || this.datacenterSet.dirty || this.so_dirty) {
      return true
    } else {
      return false
    }
  }

  commitConfig() {
    var sys = this.baseSet.controls['system_name'].value
    var versionFormat = "Version format:         " + this.baseSet.controls['version'].value
    var domain = "Domain:                 " + this.baseSet.controls['mxone_domain'].value
    var ntp = "NTP IP:                 " + this.baseSet.controls['ntp'].value
    var diff1 = "Diffserv media:         " + this.baseSet.controls['qos_media'].value
    var diff2 = "Diffserv call control:  " + this.baseSet.controls['qos_sig'].value
    var markt = "Market:                 " + this.baseSet.controls['mrkt_data'].value
    var lic = "License type:           " + this.baseSet.controls['lic_type'].value
    var dns_array = [this.baseSet.controls['dns_srv1'].value, this.baseSet.controls['dns_srv2'].value, this.baseSet.controls['dns_srv3'].value]
    var dns = "DNS forwarders:         "
    var dns_tracker = 0
    for (const d of dns_array) {
      if (d !== "") {
        dns_tracker++;
        switch (dns_tracker) {
          case 1:
            dns += d
            break;
          default:
            dns += ", " + d
        }
      }
    }

    var dns_srch = "DNS search list:        "
    var dns_s = [this.baseSet.controls['dsn_srch1'].value, this.baseSet.controls['dsn_srch2'].value, this.baseSet.controls['dsn_srch3'].value, this.baseSet.controls['dsn_srch4'].value, this.baseSet.controls['dsn_srch5'].value]
    var dnss_tracker = 0
    for (const ds of dns_s) {
      if (ds !== "") {
        dnss_tracker++;
        switch(dnss_tracker) {
          case 1:
            dns_srch += ds;
            break;
          default:
            dns_srch += ", " + ds
        }
      }
    }

    this.output = this.banner + this.un
    this.output += "# System: " + sys + this.un
    this.output += "# ==========================================================================" + this.un
    this.output += versionFormat + this.un + domain  + this.un + ntp + this.un + diff1 + this.un + diff2 + this.un
    this.output += markt + this.un + lic + this.un + dns + this.un + dns_srch + this.un

    this.output += this.un + 'Network and GW:' + this.un

    for (let i :number = 0; i < this.netwArray.length; i++) {
      var n = this.netwArray.at(i).get('network')?.value
      var s = this.netwArray.at(i).get('subnet')?.value
      var g = this.netwArray.at(i).get('gateway')?.value

      //TODO: convert subnet
      var subnet :string | undefined = ""
      if (s.length > 3) {
        subnet = this.subnetConverter(s)?.toString()
        if (subnet === null) {
          subnet = "INVALID SUBNET MASK"
        }
      } else {
        subnet = s.toString();
      }
      
      this.output += n + '/' + subnet + ' ' + g + this.un

      this.baseSet.markAsPristine();
      this.serverSet.markAsPristine();
      this.networkSet.markAsPristine();
      this.datacenterSet.markAsPristine();
      this.base_dirty = false;
      //Repeat for each dataSet

    }

    this.output += this.un

    for (let i :number = 0; i < this.fieldsArray.length; i++){
      var h = this.fieldsArray.at(i).get('host_name')?.value
      var ipv4 = this.fieldsArray.at(i).get('ipv4')?.value
      var ipv6 = this.fieldsArray.at(i).get('ipv6')?.value
      var dc = this.fieldsArray.at(i).get('dc')?.value
      var rack = this.fieldsArray.at(i).get('rack')?.value
      var p = this.fieldsArray.at(i).get('platform')?.value
      var l = this.fieldsArray.at(i).get('limno')?.value
      var m = this.fieldsArray.at(i).get('mediasrv')?.value
      var c = this.fieldsArray.at(i).get('cassip')?.value

      var host = ""
      host += "Host name:         " + h + this.un
      host += "IPv4 address:      " + ipv4 + this.un
      host += "IPv6 address:      " + ipv6 + this.un
      host += "Data Center name:  " + dc + this.un
      host += "Rack name:         " + rack + this.un
      host += "Platform:          " + p + this.un
      
      if (l == 0) {
        host += "LIM number:        " + this.un  
      } else {
        host += "LIM number:        " + l + this.un
      }
      
      if (m) {
        host += "Media Server:      yes" + this.un
      } else {
        host += "Media Server:      " + this.un
      }
      
      host += "Cassandra IP:      " + c
      host += this.un + this.un

      this.output += host
    }

    this.download_ready = true;
  }

  commitConfigSO() {
    var sys = this.baseSetServerOnly.controls['system_name'].value
    var versionFormat = "Version format:         " + this.baseSetServerOnly.controls['version'].value

    this.outputSO = this.banner + this.un
    this.outputSO += "# System: " + sys + this.un
    this.outputSO += "# ==========================================================================" + this.un
    this.outputSO += versionFormat + this.un

    this.outputSO += this.un + 'Network and GW:' + this.un

    for (let i :number = 0; i < this.netwArray.length; i++) {
      var n = this.netwArray.at(i).get('network')?.value
      var s = this.netwArray.at(i).get('subnet')?.value
      var g = this.netwArray.at(i).get('gateway')?.value

      //TODO: convert subnet
      var subnet :string | undefined = ""
      if (s.length > 3) {
        subnet = this.subnetConverter(s)?.toString()
        if (subnet === null) {
          subnet = "INVALID SUBNET MASK"
        }
      } else {
        subnet = s.toString();
      }
      
      this.outputSO += n + '/' + subnet + ' ' + g + this.un

      this.baseSetServerOnly.markAsPristine();
      this.serverSetServerOnly.markAsPristine();
      this.networkSet.markAsPristine();
      this.datacenterSet.markAsPristine();
      this.so_dirty = false;
      //Repeat for each dataSet

    }

    this.outputSO += this.un

    for (let i :number = 0; i < this.fieldsSOArray.length; i++){
      var h = this.fieldsSOArray.at(i).get('host_name')?.value
      var ipv4 = this.fieldsSOArray.at(i).get('ipv4')?.value
      var ipv6 = this.fieldsSOArray.at(i).get('ipv6')?.value
      var dc = this.fieldsSOArray.at(i).get('dc')?.value
      var rack = this.fieldsSOArray.at(i).get('rack')?.value
      var p = this.fieldsSOArray.at(i).get('platform')?.value

      var host = ""
      host += "Host name:         " + h + this.un
      host += "IPv4 address:      " + ipv4 + this.un
      host += "IPv6 address:      " + ipv6 + this.un
      host += "Data Center name:  " + dc + this.un
      host += "Rack name:         " + rack + this.un
      host += "Platform:          " + p + this.un
      
      host += this.un + this.un

      this.outputSO += host
    }

    this.downloadSO_ready = true;
  }

  download() {
    let file = new Blob([this.output], {type: '.txt'});
    let a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = "mxoneInstallData.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
  }

  downloadSO() {
    let file = new Blob([this.outputSO], {type: '.txt'});
    let a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = "mxoneAddServerData.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
  }

  enableLim(l :number) :boolean {

    if (this.fieldsArray.at(l).get('lim')?.value && l === 0) {
      return true
    } else if (this.fieldsArray.at(l).get('lim')?.value && l !== 0) {
      return false
    } else {
      return true
    }
  }

  enableCass(l :number) :boolean {
    if (this.fieldsArray.at(l).get('cass')?.value) {
      return false
    } else {
      return true
    }
  }

  dcSelection(e :MatSelectChange, l :number) {
    const v = this.dcrArray.at(e.value).get('datacenter')?.value;
    //const a = this.fieldsArray.at(l).get('dc')?.value;
    this.fieldsArray.at(l).patchValue({dc: v});
    //console.log(this.dataSet.value)
  }

  dcSOSelection(e :MatSelectChange, l :number) {
    const v = this.dcrArray.at(e.value).get('datacenter')?.value;
    //const a = this.fieldsArray.at(l).get('dc')?.value;
    this.fieldsSOArray.at(l).patchValue({dc: v});
    //console.log(this.dataSet.value)
  }

  rackArray(l :number) :string[]{
    const v = this.fieldsArray.at(l).get('dc')?.value;
    for (const dc of this.dcrArray.controls) {
      if (dc.get('datacenter')?.value === v) {
        return [dc.get('rack1')?.value, dc.get('rack2')?.value]
      }
    }
    return [""]
  }

  rackSOArray(l :number) :string[]{
    const v = this.fieldsSOArray.at(l).get('dc')?.value;
    for (const dc of this.dcrArray.controls) {
      if (dc.get('datacenter')?.value === v) {
        return [dc.get('rack1')?.value, dc.get('rack2')?.value]
      }
    }
    return [""]
  }

  rackSelection(e :MatSelectChange, l :number) {
    this.fieldsArray.at(l).patchValue({rack: e.value});
    //console.log(this.dataSet.value)
  }

  rackSOSelection(e :MatSelectChange, l :number) {
    this.fieldsSOArray.at(l).patchValue({rack: e.value});
    //console.log(this.dataSet.value)
  }

  netArray(l :number, t :string) :networkArray[]{
    var nets :networkArray[] = []
    var i = 0;
    for (const n of this.netwArray.controls) {
      if (t == n.get('type')?.value) {
        const v = n.get('network')?.value + "/" + n.get('subnet')?.value;
        
        nets.push({id: i, net: v})
      }
      i++;
    }
    return nets
  }

  subnetDoConversion(e: Event, i: number){
    var v = (e.target as HTMLInputElement).value
    var sm: number = 0;
    if (!isNaN(Number(v))) {
      if (+v > 128) {
        console.error("CIDR cannot be larger than 128");
        this.netwArray.controls.at(i)?.patchValue({type: "ipv6"});
        this.netwArray.controls.at(i)?.patchValue({subnet: 128});
        sm = 128;
      } else if (+v > 32) {
        this.netwArray.controls.at(i)?.patchValue({type: "ipv6"});
        sm = +v;
      }
      else {
        sm = +v;
      }
      //DDN format handled here
    } else {
      var s = this.subnetConverter(v);
      if (s !== null) {
        this.netwArray.controls.at(i)?.patchValue({subnet: s});
        sm = s;
      } else {
        this.netwArray.controls.at(i)?.patchValue({subnet: 32});
        sm = 32;
      }
    }
    
    //Set host network correctly once subnet known
    //TODO: verbose code - see host verify
    //TODO: handle if host address is null (i.e. user skipped host and entered subnet mask)
    
    var test :string[] = []
    var host = this.netwArray.controls.at(i)?.get('network')?.value;
    var type = this.testIpV(host);

    switch(type) {
      case "ipv4":
        var hostIp :string[] = host.split(/\./);
        var mask = this.cidrConverter(sm);
        if (mask !== null && host !== null) {
          for (let i = 0; i <= 3; i++) {
            test[i] = (+hostIp[i] & mask[i]).toString();
          }
          
          if (test.toString() !== host.toString()) {
            var n = test[0] + '.' + test[1] + '.' + test[2] + '.' + test[3];
            this.netwArray.controls.at(i)?.patchValue({network: n});
          }
        }
        break;
      case "ipv6":
        var ddn = this.ip6to4(host);
        var mask = this.cidrConverter(sm);
        if (mask?.length === ddn.length) {
          for (let i = 0; i <= 15; i++) {
            test[i] = (+ddn[i] & mask[i]).toString();
          }

          if (test.toString() !== host.toString()) {
            var n = this.ip4to6(ddn);
            var n1 = <unknown>test;
            var n2 = <ip6>n1;
            var n3 = this.ip4to6(n2);
            this.netwArray.controls.at(i)?.patchValue({network: n3});
          }
        }
        break;
      default:
        console.error("Invalid network type. Not IPv4 or IPv6.")
    }
  }

  makeFormDirty(f: FormControl, e: string){
    f.setErrors({customError: true, message: e})
    f.markAsTouched();
  }

  clearForm(f: FormControl){
    f.setErrors(null);
  }

  blockgw(e: Event, i: number) {
    //console.log((e.target as HTMLInputElement).value);
    //console.log(l);

    var host = (e.target as HTMLInputElement).value
    var netwk = this.netwArray.at(i).get('network')?.value
    var sm = this.netwArray.at(i).get('subnet')?.value

    const ip4ctrl = this.netwArray.at(i).get('gateway') as FormControl;

    if (this.hostNetworkVerify(netwk, host, +sm)) {
      this.clearForm(ip4ctrl);
    } else {
      this.makeFormDirty(ip4ctrl, "Gateway does not fit in selected host network");
    }

  }

  blockip4(e: Event, server: number, type: string) {
    //console.log((e.target as HTMLInputElement).value);
    //console.log(l);

    const ip4ctrl = this.fieldsArray.at(server).get(type) as FormControl;

    switch(type) {
      case "ipv4":
        var networkSubnetMap = networkSubnetMap4
        break;
      case "ipv6":
        var networkSubnetMap = networkSubnetMap6
        break;
      default:
        return;
    }
    
    //First time adding
    if (!networkSubnetMap.has(server)) {
      networkSubnetMap.set(server, "empty");
      this.makeFormDirty(ip4ctrl, "IP does not fit in selected host network");
    //...already present, so an edit has taken place...
    } else {
      var val = networkSubnetMap.get(server)
      switch (val) {
        case "empty":
          this.makeFormDirty(ip4ctrl, "IP does not fit in selected host network");
          break;
        default:
          var netwk = this.netwArray.at(val).get('network')?.value;
          var sm = this.netwArray.at(val).get('subnet')?.value;
          var host = this.fieldsArray.at(server).get(type)?.value;
          if (this.hostNetworkVerify(netwk, host, +sm)) {
            this.clearForm(ip4ctrl);
          } else {
            this.makeFormDirty(ip4ctrl, "IP does not fit in selected host network");
          }
      }
    }
  }

  netSelection(e :MatSelectChange, server :number, type: string) {
    //this.fieldsArray.at(l).patchValue({rack: e.value});
    //console.log(this.dataSet.value)
    //console.log(e.value);
    const ipctrl = this.fieldsArray.at(server).get(type) as FormControl;

    switch(type) {
      case "ipv4":
        var networkSubnetMap = networkSubnetMap4
        break;
      case "ipv6":
        var networkSubnetMap = networkSubnetMap6
        break;
      default:
        return;
    }
    
    if (+e.value >= 0) {
      
      //Whether Map exists or not, we set it with value
      networkSubnetMap.set(server, e.value);
      
      var netwk = this.netwArray.at(e.value).get('network')?.value;
      var sm = this.netwArray.at(e.value).get('subnet')?.value;
      var host = this.fieldsArray.at(server).get(type)?.value;

      console.log(netwk, sm, host);
      
      
      if (this.hostNetworkVerify(netwk, host, +sm)) {
        this.clearForm(ipctrl)
      } else {
        this.makeFormDirty(ipctrl, "IP does not fit in selected host network")
      }
    } else {
      networkSubnetMap.set(server, "empty");
      this.makeFormDirty(ipctrl, "IP does not fit in selected host network")
    }
  }

  blockipCass(e: Event, server: number, type: string) {
    //console.log((e.target as HTMLInputElement).value);
    //console.log(l);

    const ipctrl = this.fieldsArray.at(server).get('cassip') as FormControl;
    
    //Get network for this server from networkSubnetMap4 or networkSubnetMap6
    switch(type){
      case "ipv4":
        var networkSubnetMap = networkSubnetMap4;
        break;
      case "ipv6":
        var networkSubnetMap = networkSubnetMap6;
        break;
      default:
        var networkSubnetMap = networkSubnetMap4;
    }
    
    //Not present? The previous inputs have not been completed
    if (!networkSubnetMap.has(server)) {
      this.makeFormDirty(ipctrl, "IP does not fit in selected host network");
    //...already present, so an edit has taken place...
    } else {
      var val = networkSubnetMap.get(server);
      switch (val) {
        case "empty":
          this.makeFormDirty(ipctrl, "IP does not fit in selected host network");
          break;
        default:
          var netwk = this.netwArray.at(val).get('network')?.value;
          var sm = this.netwArray.at(val).get('subnet')?.value;
          var host = this.fieldsArray.at(server).get('cassip')?.value;
          if (this.hostNetworkVerify(netwk, host, +sm)) {
            this.clearForm(ipctrl);
          } else {
            this.makeFormDirty(ipctrl, "IP does not fit in selected host network");
          }
      }
    }
  }

  blockip4SO(e: Event, server: number, type: string) {
    //console.log((e.target as HTMLInputElement).value);
    //console.log(l);

    const ip4ctrl = this.fieldsSOArray.at(server).get(type) as FormControl;

    switch(type) {
      case "ipv4":
        var networkSubnetMapSO = networkSubnetMap4SO;
        break;
      case "ipv6":
        var networkSubnetMapSO = networkSubnetMap6SO;
        break;
      default:
        return;
    }
    
    //First time adding
    if (!networkSubnetMapSO.has(server)) {
      networkSubnetMapSO.set(server, "empty");
      this.makeFormDirty(ip4ctrl, "IP does not fit in selected host network");
    //...already present, so an edit has taken place...
    } else {
      var val = networkSubnetMapSO.get(server)
      switch (val) {
        case "empty":
          this.makeFormDirty(ip4ctrl, "IP does not fit in selected host network");
          break;
        default:
          var netwk = this.netwArray.at(val).get('network')?.value;
          var sm = this.netwArray.at(val).get('subnet')?.value;
          var host = this.fieldsSOArray.at(server).get(type)?.value;
          if (this.hostNetworkVerify(netwk, host, +sm)) {
            this.clearForm(ip4ctrl);
          } else {
            this.makeFormDirty(ip4ctrl, "IP does not fit in selected host network");
          }
      }
    }
  }

  netSelectionSO(e :MatSelectChange, server :number, type: string) {
    //this.fieldsArray.at(l).patchValue({rack: e.value});
    //console.log(this.dataSet.value)
    //console.log(e.value);
    const ipctrl = this.fieldsSOArray.at(server).get(type) as FormControl;

    switch(type) {
      case "ipv4":
        var networkSubnetMapSO = networkSubnetMap4SO
        break;
      case "ipv6":
        var networkSubnetMapSO = networkSubnetMap6SO
        break;
      default:
        return;
    }
    
    if (+e.value >= 0) {
      
      //Whether Map exists or not, we set it with value
      networkSubnetMapSO.set(server, e.value);
      
      var netwk = this.netwArray.at(e.value).get('network')?.value
      var sm = this.netwArray.at(e.value).get('subnet')?.value
      var host = this.fieldsSOArray.at(server).get(type)?.value;
      
      if (this.hostNetworkVerify(netwk, host, +sm)) {
        this.clearForm(ipctrl)
      } else {
        this.makeFormDirty(ipctrl, "IP does not fit in selected host network")
      }
    } else {
      networkSubnetMapSO.set(server, "empty");
      this.makeFormDirty(ipctrl, "IP does not fit in selected host network")
    }
  }

  hostNetworkVerify(network: string, host: string, sm: number) :boolean {
    var type = this.testIpV(host);

    switch(type){
      case "ipv4":
        //Split the octets
        var hostIp :string[] = host.split(/\./)
        if(hostIp[0] === "" || hostIp[1] === "" || hostIp[2] === "" || hostIp[3] === "") {
          console.error("Invalid IP address")
          return false
        }

        var netwIp :string[] = network.split(/\./)
        if(netwIp[0] === "" || netwIp[1] === "" || netwIp[2] === "" || netwIp[3] === "") {
          console.error("Invalid Network address")
          return false
        }
        var test :string[] = []

        //Bitwise AND serverIP with subnet = calculated network
        var mask = this.cidrConverter(sm)
        if (mask !== null) {
          for (let i = 0; i <= 3; i++) {
            test[i] = (+hostIp[i] & mask[i]).toString();
          }
        }

        //Compare whether calculated (test) network address matches set network address
        if (test.toString() === netwIp.toString()) {
          return true;
        }
        return false;
      case "ipv6":
        var ip6_ddn = this.ip6to4(host);
        var mask = this.cidrConverter(sm);
        var test :string[] = []

        if (mask?.length === ip6_ddn.length) {
          for (let i = 0; i <= 15; i++) {
            test[i] = (+ip6_ddn[i] & mask[i]).toString();
          }

          var ip6x = <unknown>test;

          if (this.ip4to6(<ip6>ip6x) === network.toString()) {
            return true;
          }
        }
        return false;
      default:
        return false;
    }

    
  }

  //$event, form index
  networkTypeVerify(e :MatSelectChange, n :number) {
    var typeSelected = e.value;
    var netSelected = this.netwArray.at(n).get('network')?.value;

    const typeCtrl = this.netwArray.at(n).get('type') as FormControl;

    if (this.testIpV(netSelected) === typeSelected) {
      this.clearForm(typeCtrl);
    } else {
      this.makeFormDirty(typeCtrl, "Network type selected does not match IP address");
    }

  }

  //Return subnet as array. /24 as [255,255,255,0]
  //TODO: Use types "ip4" and "ip6" created at top of file
  cidrConverter(c: number): number[] | null {
    if (c <= 32) {
      var s = [0,0,0,0]
    } else {
      var s = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    }
    
    var main = (c / 8) | 0;
    var minor = c % 8;
    var indice = 8 - minor;

    if (main > 0) {
      for (let i = 0; i < main; i++) {
        s[i] = 255;
      }
      s[main] = 256 - (2 ** indice);

    } else {
      console.error("Invalid cidr");
      return null
    }

    return s
    
  }

  //Return cidr when DDN passed in
  subnetConverter(s :string) :number | null {
    const octets = s.split('.');

    if (octets.length !== 4) {
        //console.error("Invalid subnet mask format. Expected 'X.X.X.X'.");
        return null;
    }
    
   let cidr = 0;
   for (let i = 0; i < 4; i++) {
    var ind = 256 - +octets[i];
    var pow = Math.log2(ind);
    var v = 8 - pow;
    cidr += v;
  }

    return cidr;
  }

  testIpV(ip: string): string {
    var v4 = ip.split(/\./).length;
    var v6 = ip.split(/\:/).length;

    if (v4 == 4 && v6 <= 1) {
      return "ipv4"
    } else if (v6 > 2 && v4 <= 1) {
      return "ipv6"
    } else if (v4 == 4 && v6 > 2) {
      console.error("Appears to be ipv4-in-ipv6. Not supported")
      return ""
    } else {
      console.error("Invalid IP address")
      return ""
    }
  }

  //Utilise current IPv4 logic for IPv6
  ip6to4(ip: string): ip6 {
    var segment = ip.split(/\:/);
    var l = segment.length;

    let out :ip6 =[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    var k = 8 - l; //Number of 0 fields squashed together

    var segInd = 0
    for (let i = 0; i < l; i++) {

      if (segment[i] === "") {
        //Can only squash once - is this it?
        if (k !== 0) {
          for (let x = 0; x <= k; x++) {
            segInd+= 2;
          }
        } else {
          segInd+= 2;
        }
      } else {
        var hex = segment[i].padStart(4, "0");
        out[segInd] = parseInt(hex[0] + hex[1], 16);
        segInd++;
        out[segInd] = parseInt(hex[2] + hex[3], 16);
        segInd++;
      }
    }
      return out
  }

  ip4to6(ip: ip6): string {
    //[254,128,0,0,0,0,0,0,10,143,195,255,254,65,77,102]
    //fe80::a8f:c3ff:fe41:4d66/64
    var v6 :string[] = []

    //Decimal to Hex - automatically removes leading 0

    var k = 0;
    for(let i = 0; i < 8; i++) {
      var a1 = +ip[k]; 
      var a = a1.toString(16);
      k++;
      var b1 = +ip[k];
      var b = b1.toString(16);
      k++;
      //Remove leading 0
      if (a === "0") {
        v6[i] = b;
      } else {
        v6[i] = a + b;
      }
    }

    //Determine series of '0'

    let zero = new Map();
    var dataset :number[] = [];
    var count = 0;
    for(let i = 0; i < 8; i++) {

      if(v6[i] === "0"){

        //Add index of each sequence of '0'
        dataset.push(i);

      } else {

        //Reset when no longer '0'
        if(dataset.length > 0){
          zero.set(count, dataset);
          count++;
          dataset = [];
        }
      }
    }

    //Cater for 0 series at end (e.g. indice 7)
    if(dataset.length > 0){
      zero.set(count, dataset);
      count++;
      dataset = [];
    }

    var most = {index: 0, length: 0};
    zero.forEach((value, key) => {
      if (value.length > most.length) {
        most.index = key,
        most.length = value.length
      }
    });

    var zeroSeries = zero.get(most.index);

    //Create IPv6
    if (v6.length !== 8) {
      console.error("Internal error with IPv6 conversion");
    }
    var ipv6: string = "";
    for(let i = 0; i < 8;i++) {
      if(v6[i] === '0') {
        //Does the indice match ZeroSeries?
        if (i === zeroSeries[0] ) {
          ipv6 += ":"
          
          if (i === 0){ //First item in IPv6 is zero? Add an extra ":"
            ipv6 += ":";
          }

          i += (zeroSeries.length - 1);
        } else {
          ipv6 += v6[i]; 
          if(i !== 7) {
            ipv6 += ":"
          }
        }
      } else {
        ipv6 += v6[i]
        if(i !== 7) {
          ipv6 += ":"
        }
      }
    }

    return ipv6
  }

  updateDC(i :number) {
    const x = this.dcrArray.at(i).get('datacenter')?.value
    this.dcrArray.at(i).get('datacenter')?.patchValue(x)
    const y = this.dcrArray.at(i).get('rack1')?.value
    this.dcrArray.at(i).get('rack1')?.patchValue(y)
    const z = this.dcrArray.at(i).get('rack2')?.value
    this.dcrArray.at(i).get('rack2')?.patchValue(z)
  }

  updateNet(i :number) {
    const x = this.netwArray.at(i).get('network')?.value
    this.netwArray.at(i).get('network')?.patchValue(x)
    const y = this.netwArray.at(i).get('subnet')?.value
    this.netwArray.at(i).get('subnet')?.patchValue(y)
    const z = this.netwArray.at(i).get('gateway')?.value
    this.netwArray.at(i).get('gateway')?.patchValue(z)
    const v = this.netwArray.at(i).get('type')?.value
    this.netwArray.at(i).get('type')?.patchValue(v)
  }

  harmonise_dirty() { 
    if (this.output !== "" && this.outputSO !== "") {
      this.base_dirty = true;
      this.so_dirty = true;
    } else if (this.output !== "" && this.outputSO === "") {
      this.base_dirty = true;
      this.so_dirty = false;
    } else if (this.output === "" && this.outputSO !== "") {
      this.base_dirty = false;
      this.so_dirty = true;
    } else {
      this.base_dirty = false;
      this.so_dirty = false;
    }
  }

  /*TODO
  cass ip == ipv6 if ipv6 being used
  (1) Valid IP verifier
  (3) Verify valid/clashing LIM no
  (4) Test for IP clashes 

  */

}
