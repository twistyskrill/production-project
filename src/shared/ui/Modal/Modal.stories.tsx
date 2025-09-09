import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button } from "../Button/Button";
import { Modal } from "./Modal";
import { ThemeDecorator } from "shared/config/storybook/ThemeDecorator/ThemeDecorator";
import { Theme } from "app/providers/ThemeProvider";

export default {
  title: "shared/Modal",
  component: Modal,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => <Modal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur sunt hic est, nesciunt reprehenderit autem provident! Adipisci nulla blanditiis sequi molestiae? Sapiente placeat aspernatur laborum harum laboriosam perferendis et officia.",
  isOpen: true,
};

export const Dark = Template.bind({});
Dark.args = {
  children:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur sunt hic est, nesciunt reprehenderit autem provident! Adipisci nulla blanditiis sequi molestiae? Sapiente placeat aspernatur laborum harum laboriosam perferendis et officia.",
  isOpen: true,
};

Dark.decorators = [ThemeDecorator(Theme.DARK)];
