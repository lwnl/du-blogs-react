import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faLink,
  faImage,
  faCommentDots,
  faHeading,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";

interface EditorToolbarProps {
  editor: any;
  setLink: () => void;
  addImage: () => void;
  addVideo: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  setLink,
  addImage,
  addVideo,
}) => {
  return (
    <div className="editor-toolbar">
      <Tooltip title="粗体">
        <FontAwesomeIcon
          icon={faBold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
      </Tooltip>

      <Tooltip title="斜体">
        <FontAwesomeIcon
          icon={faItalic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
      </Tooltip>

      <Tooltip title="小标题">
        <FontAwesomeIcon
          icon={faHeading}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 5 }).run()
          }
        />
      </Tooltip>

      <Tooltip title="超链接">
        <FontAwesomeIcon icon={faLink} onClick={setLink} />
      </Tooltip>

      <Tooltip title="图片">
        <FontAwesomeIcon icon={faImage} onClick={addImage} />
      </Tooltip>

      <Tooltip title="图说">
        <FontAwesomeIcon
          icon={faCommentDots}
          onClick={() => {
            editor
              ?.chain()
              .focus()
              .setNode("paragraph", { class: "image-caption" })
              .run();
          }}
        />
      </Tooltip>

      <Tooltip title="视频">
        <FontAwesomeIcon icon={faVideo} onClick={addVideo} />
      </Tooltip>
    </div>
  );
};

export default EditorToolbar;
