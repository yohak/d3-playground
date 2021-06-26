import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  @keyframes dash {
    to {
      stroke-dashoffset: -80;
    }
  }

  .graph-cover {
    opacity: 0;
    pointer-events: none;
    transition-duration: 0.3s;
    transition-property: opacity;
    transition-timing-function: ease-in-out;

    &.active {
      opacity: 0.8;
    }
  }

  .line-group {
    cursor: pointer;
    path.dashed {
      pointer-events: none;
    }

    &.active {
      path.dashed {
        animation-name: dash;
        animation-duration: 2000ms;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
    }

    &.inactive {
    }
  }
`;
