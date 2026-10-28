import { useEffect, useRef } from "react";
import karachiMap from "../assets/karachi-digital-map.svg?raw";

// Reuse the map's actual road geometry, including its curved coastal road.
// Decorative miniature buses only; these are not live vehicle positions.
const routes = [...karachiMap.matchAll(/<path data-bus-route="true" d="([^"]+)"/g)]
  .map((match) => match[1]);
const mapPaths = [...karachiMap.matchAll(/<path[^>]* d="([^"]+)"/g)].map((match) => match[1]);
// Include the existing upper/lower roads, which remain visible around the card
// when the map is cropped on mobile. Each repeated route has separated starts.
const upperRoad = mapPaths.find((path) => path.startsWith("M-70 156"));
const lowerRoad = mapPaths.find((path) => path.startsWith("m-80 865"));
const busRoutes = [upperRoad, lowerRoad, routes[0], upperRoad, lowerRoad, routes[0],
  routes[1], routes[2], routes[3], routes[4], routes[1], routes[2]];

const LoginRouteNetwork = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 600px)");
    const lowPower = () => navigator.connection?.saveData ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const roads = [...svg.querySelectorAll(".login-bus-trail")];
    const buses = [...svg.querySelectorAll(".login-route-bus")];
    const lengths = roads.map((road) => road.getTotalLength());
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let startingDistances = lengths.map((length, index) => length * (0.18 + (index % 3) * 0.3));
    const isStatic = () => reducedMotion.matches || mobile.matches || lowPower();

    const draw = () => {
      roads.forEach((road, index) => {
        if (mobile.matches && index >= 6) return;
        const length = lengths[index];
        const speed = 8 + busRoutes.indexOf(busRoutes[index]) % 3;
        const distance = (startingDistances[index] + elapsed * speed / 1000) % length;
        const point = road.getPointAtLength(distance);
        // Sampling either side of the bus smooths its heading around junctions.
        const behind = road.getPointAtLength(Math.max(0, distance - 8));
        const ahead = road.getPointAtLength(Math.min(length, distance + 8));
        const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
        const opacity = Math.min(1, distance / 30, (length - distance) / 30);
        buses[index].setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
        buses[index].style.opacity = opacity;
        const trail = Math.min(58, distance);
        road.style.strokeDasharray = `${trail} ${length}`;
        road.style.strokeDashoffset = -(distance - trail);
        road.style.opacity = opacity * 0.3;
      });
    };
    const tick = (now) => {
      if (document.hidden || isStatic()) return;
      if (now - previous >= 1000 / 24) {
        elapsed += previous ? Math.min(now - previous, 100) : 0;
        previous = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const syncMotion = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (document.hidden) return;
      draw();
      if (!isStatic()) frame = requestAnimationFrame(tick);
    };
    const distribute = () => {
      const bounds = svg.getBoundingClientRect();
      const card = svg.parentElement.querySelector(".login-card").getBoundingClientRect();
      const scale = Math.max(bounds.width / 1600, bounds.height / 1000);
      const left = bounds.left + (bounds.width - 1600 * scale) / 2;
      const top = bounds.top + (bounds.height - 1000 * scale) / 2;
      const occupied = [];
      startingDistances = roads.map((road, index) => {
        const candidates = [];
        const length = lengths[index];
        for (let sample = 1; sample < 80; sample++) {
          const distance = length * sample / 80;
          const point = road.getPointAtLength(distance);
          const x = left + point.x * scale;
          const y = top + point.y * scale;
          if (x < bounds.left + 18 || x > bounds.right - 18 || y < bounds.top + 18 || y > bounds.bottom - 18) continue;
          if (x > card.left - 18 && x < card.right + 18 && y > card.top - 18 && y < card.bottom + 18) continue;
          if (occupied.some((placed) => Math.hypot(x - placed.x, y - placed.y) < 36)) continue;
          candidates.push(distance);
        }
        const repeated = busRoutes.indexOf(busRoutes[index]) !== index;
        const distance = candidates[Math.floor(candidates.length * (repeated ? 0.76 : 0.24))] ?? length * 0.3;
        const point = road.getPointAtLength(distance);
        occupied.push({ x: left + point.x * scale, y: top + point.y * scale });
        return distance;
      });
      syncMotion();
    };
    const observer = new ResizeObserver(distribute);
    observer.observe(svg.parentElement);
    document.addEventListener("visibilitychange", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);
    mobile.addEventListener("change", distribute);
    navigator.connection?.addEventListener?.("change", syncMotion);
    distribute();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      reducedMotion.removeEventListener("change", syncMotion);
      mobile.removeEventListener("change", distribute);
      navigator.connection?.removeEventListener?.("change", syncMotion);
    };
  }, []);

  return (
    <svg ref={svgRef} className="login-route-network" viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {busRoutes.map((route, index) => (
        <g key={index} className={index % 2 ? "login-bus-purple" : "login-bus-cyan"}>
          <path className="login-bus-trail" d={route} fill="none" />
          <g className="login-route-bus">
            <rect className="login-bus-body" x="-12" y="-6" width="24" height="12" rx="3" />
            <rect className="login-bus-window" x="6" y="-4" width="3" height="8" rx="1" />
            <rect className="login-bus-roof" x="-6" y="-3" width="8" height="6" rx="1.5" />
            <path className="login-bus-wheels" d="M-7-6v-1M7-6v-1M-7 6v1M7 6v1" />
          </g>
        </g>
      ))}
    </svg>
  );
};

export default LoginRouteNetwork;
