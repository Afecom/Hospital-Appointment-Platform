import { Headset, BellDot, Search } from "lucide-react";
import { Role } from "@repo/database";
import ButtonComponent from "../ui/button";
export default function HeaderSection({ role }: { role: Role }) {
  return (
    <header
      className={`bg-green-400 w-full flex items-center justify-between py-1.5 px-4`}
    >
      <img
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO8AAADTCAMAAABeFrRdAAAAq1BMVEX///8GMlFWx/EALU0AHkW7wMYAJ0oAFD8AJEh5h5WVoawAKUtDXHJOY3cAADkAGkIAED7M0tc8Vm2cpK3c4ubt7/EACTsAADT09PWDjZosSGJicYLGy9Bufo5Ew/DT2d70+/5rzPKKlqLl5eWIiYmxsrKF1PSd3PbJycl9fn6cnZ3e3t5zdHRyz/Oosruo3/fc8vzr+P0YPFlabH8AADAAACYTOFYmRF81T2f8XfafAAAFUUlEQVR4nO2daXuiOhiGoSxBUYxaIhatFrvMctoztT1T//8vO7hBEqLFUQl2nvtDr0aivjfBbJhoGAAAAAAAAIADmc10R1Aps/tv33XHUCWzB+Php+4gKmT2/ce97hiqZFm+33QHUSGp788H3UFUyOyfH/eR7iAAAAAAAAAAAAAAAAAAVMb06THlSXcYlfF8e5Vy+6g7jqpY6abojqMipvC9NKK4YyuIlZm/gG/SMVWQF1Xmre9t1VGejoar9PWaqsxPm+K9+rfqME9GOd/p413K1fZyTv9Zph+nemI+hnK+z5kpzyW2w+V8VbaXWW8d5XunKegjgC98DeNO7fusKegjKOf763YFVzWvkq+agj6Csv2Nacrr81b38XWZ1hHvsRzUv3rd9ienFUd5Og7y/QLj34N8v8D4CL7wzbncfsaWw3x/rXUvsN3dcpjv5QNf+H4l4PvFff2/y7dnKX39se7A/pSJs4/YU+qmBdzY+7yJbi014dgjqttDGeqreYm793nEH9ZwPVSXqGujU+D517r1ZCbsbLYpVifULSgxV9dFp8Jv6RYUcdS3Ok8H6epWFIh3V0anwR3qVhQ48+WcfoLfdCsKnLt4TateH2D4whe+8IUvfOsAfOELX/jCF751YJevZXcydp8TL89k7xhIX4av+zbqZjR2zT/bSZ5p1FILX4avKWRql7q/QC7XVwqy3P2jUi+lm3K+pe4PqjPBVyvwhS984WvAF741AL7whS98DfjCtwbAF77wvVzfUkGW81XP2lq9KnU+pWX7VpGOONPap4o8lh844kt5qlydRpU6nxKO2woa0veWk1avSLtf6qWqcwEAAAAAAAD8EUnCJSIhlT2o2E1y0uSGQKOEG/91myM+Yz+Rl1UlCb+SLkqaOcn5f/fznXEjnmjwXszxwgbFpX7OIF89NGKEi7M5EAY+vY74jR6jSQf8Uslw4AUZ/51/yRmzeV9KiznmrlcsdYdke6ZOqM0L9ImwbqxliYP/0DaJ4EvNUc75V8l+6ttljQ+r8Gjue02oUCoFX4vyl8fYK/geHPMxfOobB7OmNF9hcL4zlwmf14Kvv/C47XMnbH5Ta98w6BkhK0w1bX1Dn0nnQvbtOL9Zvn69R156tM6+ybJs3wJ5xf3GNzQDufKWfUnXoYvsafTGuKm1r++mf0aBvOHC2jeaB4WdJwq+I2NBt9eAybrafflUwdcJVnXznEo159r3wy7W3ArfLvHXiSZJWzHNvlZjmNHwZd8FW1WuTSZNOa58e54iVoWvEZPVeQnpctF+wTfrbkjvcRaYSfP2npqS7yRYdysiNhcPLH1bdNEpbiyi8g1tsjxta23Jl5jbdx9UUdLM5b6/PbIl33GwaVvHUquT+sbB0FgUqiulb3ohx8uOyaodL5TvJOMEPp+xt76K6O/J6kRM+nZbOOLYFmssC47J+2gofQ0z7ZQs6Ork6K6v9vj2PW+whvlCLyH1tVfd5G4gh6v2Tdskh6ybpRr7zjv9bKscW9BwyObGWcLEgt/ha7Rcn66v1/r6jshH9v+EevyhvP/cZmITvMP3mnqbuq2+vm3+dxR6wo8q5L6RJVZlO3yNobsZNtTW95rwfZHtx2+byseDzOUHQLt8M2rrOxTv0LqUay84X6MvDCcO973OOf8eQgO+pxgFA+4QCYQqOWHcuM4JuN1R3gLuxPQDwbcXyL4f4vxG4LKsv/OumE46MfGY9405pW4sbnATxnHEHeRrqXGcKzix0AVJYrkX0YiF+at4zFEYZwMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzsb/oTR88xFBGs8AAAAASUVORK5CYII="
        alt=""
        className="h-9 w-9 rounded-xl"
      />
      <div className="flex gap-3.5 text-blue-950 min-w-0 items-center">
        <div className="relative min-w-0 w-48 md:w-64">
          <div className="absolute text-blue-950 right-2 top-1">
            <Search size={18} />
          </div>
          <input
            type="text"
            name="search"
            id="mainSearchBar"
            className="border-2 rounded-lg border-blue-950 px-4 outline-none text-blue-950 text-center w-full max-w-full"
            placeholder={`${
              role === "admin" ? "Search users and settings" : "Search anything"
            }`}
          />
        </div>
        <ButtonComponent>
          <Headset />
        </ButtonComponent>
        <ButtonComponent>
          <BellDot />
        </ButtonComponent>
      </div>
    </header>
  );
}
