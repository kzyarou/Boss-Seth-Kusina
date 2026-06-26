export const manifest = {
  screens: {
    scr_jwp95q: { name: "Home Feed", route: "/", position: { "x": 160, "y": 220 } },
    scr_bydup5: { name: "Recipe Detail", route: "/recipe/r1", position: { "x": 4360, "y": 220 } },
    scr_6plrsn: { name: "Categories", route: "/categories", position: { "x": 1560, "y": 220 } },
    scr_m09juk: { name: "Search", route: "/search", position: { "x": 2960, "y": 220 } },
    scr_funjy3: { name: "Upload Recipe", route: "/upload", position: { "x": 2960, "y": 2200 } },
    scr_ctrolt: { name: "Profile", route: "/profile", position: { "x": 160, "y": 2200 } },
    scr_ouq3hl: { name: "Saved", route: "/saved", position: { "x": 1560, "y": 2200 } },
    scr_znvnci: { name: "Notifications", route: "/notifications", position: { "x": 4360, "y": 2200 } },
    scr_czfwlp: { name: "Admin Dashboard", route: "/admin", position: { "x": 160, "y": 4180 } }
  },
  sections: {
    sec_bjc9i3: { name: "Recipe Discovery", x: 0, y: 0, width: 5720, height: 1180 },
    sec_d7r33l: { name: "User Hub", x: 0, y: 1980, width: 5720, height: 1180 },
    sec_2y7srw: { name: "Admin Panel", x: 0, y: 3960, width: 1520, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_bjc9i3", children: [
    { kind: "screen", id: "scr_jwp95q" },
    { kind: "screen", id: "scr_6plrsn" },
    { kind: "screen", id: "scr_m09juk" },
    { kind: "screen", id: "scr_bydup5" }]
  },
  { kind: "section", id: "sec_d7r33l", children: [
    { kind: "screen", id: "scr_ctrolt" },
    { kind: "screen", id: "scr_ouq3hl" },
    { kind: "screen", id: "scr_funjy3" },
    { kind: "screen", id: "scr_znvnci" }]
  },
  { kind: "section", id: "sec_2y7srw", children: [
    { kind: "screen", id: "scr_czfwlp" }]
  }]

};