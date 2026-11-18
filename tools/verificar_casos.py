from fractions import Fraction as F

def aro(v, a): return F(v, a)
def nota_p(x):
    if x >= 1: return 5
    if x >= F(1,3): return 4
    if x >= F(1,5): return 3
    if x >= F(1,10): return 2
    return 1
def nota_d(d, m):
    if d >= m: return 5
    if 3*d >= m: return 4
    if 12*d >= m: return 3
    if 144*d >= m: return 2
    return 1
def nivel(r): return "Bajo" if r <= 4 else ("Medio" if r <= 12 else "Alto")

ok = True
def chk(nombre, obtenido, esperado):
    global ok
    bien = obtenido == esperado
    ok &= bien
    print(("OK  " if bien else "FALLA"), nombre, obtenido, "" if bien else f"(esperado {esperado})")

chk("T1 ALE", 150000*aro(2,5), 60000)
chk("T2 ALE", 20000*aro(5,1), 100000)
chk("T3 ALE", 1000000*aro(1,10), 100000)
chk("T4 P", nota_p(aro(1,3)), 4)
chk("T5 P", nota_p(aro(1,10)), 2)
chk("T6 P", nota_p(aro(1,1)), 5)
chk("T7 P", nota_p(aro(1,5)), 3)
chk("T8 D", nota_d(720,720), 5)
chk("T9 D", [nota_d(5,720), nota_d(60,720), nota_d(240,720)], [2,3,4])
chk("T10 nivel", [nivel(x) for x in (4,5,12,15)], ["Bajo","Medio","Medio","Alto"])
chk("T11 computador", (2000000*1*F(1,10), 2000000*F(1,2)*F(1,10), 2000000*F(1,10)-2000000*F(1,2)*F(1,10)-40000), (200000,100000,60000))
chk("T12 cuali comp", (2*5, 2*4, nivel(10), nivel(8)), (10,8,"Medio","Medio"))
# celular rotura
va=150000
sle_s=va*F(30,100); sle_c=va*F(10,100)
ale_s=sle_s*1; ale_c=sle_c*1
costo=F(30000,3)
chk("T13 rotura", (sle_s, sle_c, costo, ale_s-ale_c-costo, 5*3, nivel(15), 5*1, nivel(5)), (45000,15000,10000,20000,15,"Alto",5,"Medio"))
chk("T13b costo 30000/año", ale_s-ale_c-30000, 0)
# robo
a=aro(1,3)
chk("T14 robo", (va*1*a, nota_p(a), max(5,5,4,1), max(3,3,4,1), nota_p(a)*5, nivel(20), nota_p(a)*4, nivel(16)), (50000,4,5,4,20,"Alto",16,"Alto"))
# seguro
fe=F(va-80000, va)
sle_seg=va*fe; ale_seg=sle_seg*a; red=va*a-ale_seg
chk("T15 seguro", (fe, sle_seg, float(ale_seg), float(red), float(red-44000), 4*3, nivel(12)), (F(7,15), 70000, 23333.333333333332, 26666.666666666668, -17333.333333333332, 12, "Medio"))
# orden final por riesgo residual, desempate por ALE residual
riesgos=[("Rotura",5,50000-0,15000),("Robo",16,50000,50000)]
orden=sorted([("Rotura",5,15000),("Robo",16,50000)], key=lambda r:(-r[1],-r[2]))
chk("T16 orden", [r[0] for r in orden], ["Robo","Rotura"])
print("FE seguro %:", float(fe*100))
chk("tabla niveles", sorted({p*i for p in range(1,6) for i in range(1,6)}), [1,2,3,4,5,6,8,9,10,12,15,16,20,25])
# --- Tratamiento del riesgo (docs/03-tratamiento.md) ---
ORDEN = {"Bajo": 1, "Medio": 2, "Alto": 3}
def sugerir(riesgo_sin, neto, transfiere=False, umbral="Bajo"):
    if ORDEN[nivel(riesgo_sin)] <= ORDEN[umbral]: return "aceptar"
    if neto is not None and neto > 0: return "transferir" if transfiere else "mitigar"
    return "evitar_o_aceptar"
def pide_far(riesgo_aceptado, umbral="Bajo"): return ORDEN[nivel(riesgo_aceptado)] > ORDEN[umbral]
neto_rotura = ale_s - ale_c - costo
neto_borrado = va*a - va*a - 0          # el borrado no cambia el ALE y cuesta $0
neto_seguro = red - 44000
chk("T17 rotura: mitigar", (neto_rotura, sugerir(15, neto_rotura)), (20000, "mitigar"))
chk("T18 robo/borrado: evitar o aceptar", (neto_borrado, nivel(16), sugerir(20, neto_borrado)), (0, "Alto", "evitar_o_aceptar"))
chk("T19 seguro: no se sugiere; aceptar pide FAR", (neto_seguro < 0, sugerir(16, neto_seguro, True), pide_far(16)), (True, "evitar_o_aceptar", True))
chk("T20 riesgo bajo: aceptar sin formulario", (sugerir(4, None), pide_far(4)), ("aceptar", False))
chk("T20b umbral Medio", (sugerir(12, None, umbral="Medio"), pide_far(12, "Medio"), pide_far(15, "Medio")), ("aceptar", False, True))
print("\nTODO OK" if ok else "\nHAY FALLAS")
