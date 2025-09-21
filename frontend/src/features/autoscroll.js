// Создаёт две "невидимые" зоны автоскролла в контейнере со скроллом.
// Пока курсор над верхней/нижней зоной во время DnD — идёт прокрутка.
// Возвращает cleanup() для отписки и удаления зон.
export function enableAutoScrollZones(scrollContainer, {
  zoneHeight = 40,       // высота зон, px
  maxSpeed = 12,         // px/кадр
  minSpeed = 6           // px/кадр
} = {}) {
  const topZone = document.createElement("div");
  const botZone = document.createElement("div");

  topZone.className = "scroll-zone scroll-zone--top";
  botZone.className = "scroll-zone scroll-zone--bottom";

  topZone.style.height = `${zoneHeight}px`;
  botZone.style.height = `${zoneHeight}px`;

  // Зоны делаем sticky, чтобы всегда были у краёв видимой области контейнера
  topZone.style.position = "sticky";
  botZone.style.position = "sticky";
  topZone.style.top = "0";
  botZone.style.bottom = "0";

  // Они должны принимать drag-события
  topZone.style.pointerEvents = "auto";
  botZone.style.pointerEvents = "auto";

  // Вставим в начало и конец контейнера (важно: контейнер — flex/flow, не grid)
  scrollContainer.prepend(topZone);
  scrollContainer.append(botZone);

  let raf = null;
  let dir = 0; // -число вверх, +число вниз, 0 — стоп
  let active = false;

  function step() {
    if (!dir) return;
    const maxUp = scrollContainer.scrollTop;
    const maxDown = scrollContainer.scrollHeight - scrollContainer.clientHeight - scrollContainer.scrollTop;

    const v = Math.max(minSpeed, Math.min(maxSpeed, Math.abs(dir)));
    if (dir < 0 && maxUp > 0) scrollContainer.scrollTop -= v;
    else if (dir > 0 && maxDown > 0) scrollContainer.scrollTop += v;
    else { stop(); return; }

    raf = requestAnimationFrame(step);
  }

  function start(nextDir) {
    dir = nextDir;
    if (!raf) raf = requestAnimationFrame(step);
  }
  function stop() {
    dir = 0;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function mapRange(v, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) return outMin;
    const t = Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)));
    return outMin + (outMax - outMin) * t;
  }

  // Общий обработчик для обеих зон
  function onDragOverFactory(dirSign, zoneEl) {
    return (e) => {
      if (!active) return; // скроллим только во время реального drag
      e.preventDefault();
      // скорость пропорциональна близости к краю зоны
      const rect = zoneEl.getBoundingClientRect();
      const y = e.clientY;
      let speed;
      if (dirSign < 0) {
        // верхняя зона: чем ближе к top — тем быстрее
        speed = -mapRange(y, rect.bottom, rect.top, minSpeed, maxSpeed);
      } else {
        // нижняя зона: чем ближе к bottom — тем быстрее
        speed = mapRange(y, rect.top, rect.bottom, minSpeed, maxSpeed);
      }
      start(speed);
    };
  }

  const onTopOver = onDragOverFactory(-1, topZone);
  const onBotOver  = onDragOverFactory(1, botZone);

  function onDragEnter() { active = true; }
  function onDragLeave() { stop(); }               // ушли из зоны — стоп
  function onAnyDrop()   { stop(); active = false; }

  // События
  topZone.addEventListener("dragover", onTopOver);
  botZone.addEventListener("dragover", onBotOver);

  topZone.addEventListener("dragenter", onDragEnter);
  botZone.addEventListener("dragenter", onDragEnter);

  topZone.addEventListener("dragleave", onDragLeave);
  botZone.addEventListener("dragleave", onDragLeave);

  // На сам контейнер — чтобы точно остановиться в конце
  scrollContainer.addEventListener("drop", onAnyDrop);
  scrollContainer.addEventListener("dragend", onAnyDrop);

  // Чистка
  function cleanup() {
    stop();
    topZone.removeEventListener("dragover", onTopOver);
    botZone.removeEventListener("dragover", onBotOver);
    topZone.removeEventListener("dragenter", onDragEnter);
    botZone.removeEventListener("dragenter", onDragEnter);
    topZone.removeEventListener("dragleave", onDragLeave);
    botZone.removeEventListener("dragleave", onDragLeave);
    scrollContainer.removeEventListener("drop", onAnyDrop);
    scrollContainer.removeEventListener("dragend", onAnyDrop);
    topZone.remove();
    botZone.remove();
  }

  return { cleanup, topZone, botZone };
}